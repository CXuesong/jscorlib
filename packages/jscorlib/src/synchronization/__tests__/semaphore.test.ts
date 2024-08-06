import { describe, expect, it } from "vitest";
import { InvalidOperationError, TimeoutError } from "../../errors";
import { delay, wait } from "../../promises";
import * as _Synchronization from "../semaphore";

describe("Semaphore", () => {
  it("basic traits", () => {
    const s = new _Synchronization.Semaphore(3, 5);
    expect(s.count).toBe(3);
    expect(s.maxCount).toBe(5);
    expect(s.wait()).toBe(true);
    expect(s.count).toBe(2);
    expect(s.wait()).toBe(true);
    expect(s.count).toBe(1);
    expect(s.wait()).toBe(true);
    expect(s.count).toBe(0);
    expect(s.wait()).toBe(false);
    expect(s.wait()).toBe(false);

    s.release();
    expect(s.count).toBe(1);
    s.release();
    expect(s.count).toBe(2);
    expect(() => s.release(5)).toThrow(InvalidOperationError);
    expect(s.count).toBe(2);
    s.release(3);
    expect(s.count).toBe(5);
    expect(() => s.release()).toThrow(InvalidOperationError);
  });

  it("usage1.1: prevent an async function from reentrancy: keep latest", async () => {
    const submittedContentList: string[] = [];

    // Which version is the latest version we need to submit?
    let submittingContentToken = 0;
    const submitContentSemaphore = new _Synchronization.Semaphore(1, 1);
    const submitContent = async (content: string) => {
      submittingContentToken++;
      const currentToken = submittingContentToken;
      // Wait for prior submissions to complete first.
      await submitContentSemaphore.waitAsync();
      try {
        // Has somebody else submitted content while we are waiting?
        if (submittingContentToken !== currentToken) return;
        // Pretend we are saving something (real quick)
        await delay(100);
        submittedContentList.push(content);
      } finally {
        submitContentSemaphore.release();
      }
    };

    await submitContent("content-1");
    expect(submittedContentList).toStrictEqual(["content-1"]);
    // Wait for content-2 for a short while to ensure it actually "start saving"
    await expect(() => wait(submitContent("content-2"), 20)).rejects.toBeInstanceOf(TimeoutError);
    // these are discarded while "content-2" is still being saved.
    void submitContent("content-3");
    void submitContent("content-4");
    await submitContent("content-5");
    expect(submittedContentList).toStrictEqual(["content-1", "content-2", "content-5"]);
  });
});
