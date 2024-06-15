import { describe, expect, beforeEach, afterEach, it, vi } from "vitest";
import * as _Events from "../eventEmitter";
import * as Promises from "../../promises";
import { SynchronizationContext } from "../../synchronization";

describe("eventEmitter", () => {
  let unhandledErrors: Error[] = [];
  let prevSyncContext: SynchronizationContext | undefined;

  class TestSynchronizationContext extends SynchronizationContext {
    private _pendingCallbacks = new Set<Promise<void>>();
    public override post(callback: () => void): void {
      const { promise, resolve } = Promise.withResolvers<void>();
      this._pendingCallbacks.add(promise);
      queueMicrotask(() => {
        try {
          callback();
        } catch (err) {
          unhandledErrors.push(err as Error);
        } finally {
          resolve();
          this._pendingCallbacks.delete(promise);
        }
      });
    }
    public async waitCallbacks(): Promise<void> {
      await Promises.whenAll(this._pendingCallbacks);
    }
  }

  beforeEach(() => {
    prevSyncContext = SynchronizationContext.current;
    SynchronizationContext.current = new TestSynchronizationContext();
  });
  afterEach(() => {
    SynchronizationContext.current = prevSyncContext!;
    prevSyncContext = undefined;
    unhandledErrors = [];
  });
  it("simple handlers", async () => {
    const emitter = new _Events.EventEmitter<string>();
    const handler1 = vi.fn();

    // Empty
    emitter.invoke("a");
    await emitter.invokeAsync("b");

    {
      using _void = emitter.subscribe(handler1);
      emitter.invoke("c");
      await emitter.invokeAsync("d");
    }

    emitter.invoke("e");

    expect(handler1.mock.calls).toStrictEqual([
      ["c"],
      ["d"],
    ]);
  });

  it("async handlers - sync invoke", async () => {
    const ASYNC_DELAY = 200;
    const ASYNC_CHECK_DELAY = 220;

    const emitter = new _Events.EventEmitter<string>();
    const handler1 = vi.fn();
    const handler2 = vi.fn(async () => {
      await new Promise(res => setTimeout(res, ASYNC_DELAY));
    });

    {
      using _void1 = emitter.subscribe(handler1);
      using _void2 = emitter.subscribe(handler2);
      using _void3 = emitter.subscribe(handler1);

      emitter.invoke("e");
      emitter.invoke("f");
    }

    expect(handler1.mock.calls).toStrictEqual([
      ["e"],
      ["e"],
      ["f"],
      ["f"],
    ]);
    expect(handler2.mock.calls).toStrictEqual([
      ["e"],
      ["f"],
    ]);

    // Not resolved yet
    expect(handler2.mock.results).toHaveLength(2);
    expect(handler2.mock.results[0].type).toBe("return");
    expect(handler2.mock.results[0].value).toBeInstanceOf(Promise);
    expect(handler2.mock.results[1].type).toBe("return");
    expect(handler2.mock.results[1].value).toBeInstanceOf(Promise);

    // Wait for resolution
    await new Promise(res => setTimeout(res, ASYNC_CHECK_DELAY));

    expect(handler2.mock.results).toHaveLength(2);
    expect(handler2.mock.results[0].type).toBe("return");
    expect(handler2.mock.results[0].value).toBeUndefined();
    expect(handler2.mock.results[1].type).toBe("return");
    expect(handler2.mock.results[1].value).toBeUndefined();
  });

  it("async handlers - async invoke", async () => {
    const ASYNC_DELAY = 200;
    const ASYNC_CHECK_DELAY = 220;

    const emitter = new _Events.EventEmitter<string>();
    const handler1 = vi.fn(async () => {
      await new Promise(res => setTimeout(res, ASYNC_DELAY));
    });

    {
      using _void1 = emitter.subscribe(handler1);
      using _void2 = emitter.subscribe(handler1);

      // handler1 is triggered 2x. They should be triggered concurrenctly.
      const pa = emitter.invokeAsync("a");
      const resolved = await Promise.race([pa, new Promise<"timeout">(res => setTimeout(() => res("timeout"), ASYNC_CHECK_DELAY))]);
      expect(resolved).toBeUndefined();

      await emitter.invokeAsync("b");
    }

    expect(handler1.mock.calls).toStrictEqual([
      ["a"],
      ["a"],
      ["b"],
      ["b"],
    ]);
    // All the handlers should have completed here.
    expect(handler1.mock.results).toStrictEqual([
      {
        "type": "return",
        "value": undefined,
      },
      {
        "type": "return",
        "value": undefined,
      },
      {
        "type": "return",
        "value": undefined,
      },
      {
        "type": "return",
        "value": undefined,
      },
    ]);
  });

  it("unhandled errors - sync", async () => {
    const emitter = new _Events.EventEmitter<string>();
    const handler1 = vi.fn((arg: string) => {
      throw new Error(`Error from event: ${arg}`);
    });

    {
      using _void1 = emitter.subscribe(handler1);
      emitter.invoke("a");
    }

    expect(handler1.mock.calls).toStrictEqual([
      ["a"],
    ]);
    expect(handler1.mock.calls).toStrictEqual([["a"]]);
    expect(handler1.mock.results[0].type).toBe("throw");

    await (SynchronizationContext.current as TestSynchronizationContext).waitCallbacks();
    expect(unhandledErrors).toHaveLength(1);
    expect(unhandledErrors[0].message).toBe("Error from event: a");
  });

  it("unhandled errors - async", async () => {
    const emitter = new _Events.EventEmitter<string>();
    const handler1 = vi.fn((arg: string) => {
      throw new Error(`Error from event (sync): ${arg}`);
    });
    const handler2 = vi.fn(async (arg: string) => {
      await new Promise(res => setTimeout(res, 100));
      throw new Error(`Error from event (async): ${arg}`);
    });

    {
      using _void1 = emitter.subscribe(handler1);
      using _void2 = emitter.subscribe(handler2);
      using _void3 = emitter.subscribe(handler1);
      using _void4 = emitter.subscribe(handler2);
      await emitter.invokeAsync("a");
    }

    expect(handler1.mock.calls).toStrictEqual([
      ["a"],
      ["a"],
    ]);
    expect(handler1.mock.results[0].type).toBe("throw");
    expect(handler1.mock.results[1].type).toBe("throw");

    expect(handler2.mock.calls).toStrictEqual([
      ["a"],
      ["a"],
    ]);
    expect(handler2.mock.results[0].type).toBe("throw");
    expect(handler2.mock.results[1].type).toBe("throw");

    await (SynchronizationContext.current as TestSynchronizationContext).waitCallbacks();
    expect(unhandledErrors).toHaveLength(2);
    expect(unhandledErrors[0].message).toBe("Error from event (sync): a");
    expect(unhandledErrors[1].message).toBe("Error from event (sync): a");
  });
});
