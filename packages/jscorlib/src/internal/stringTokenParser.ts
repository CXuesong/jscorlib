import { Diagnostics } from "jscorlib";
import { EqualityComparer } from "../collections/equalityComparison";
import { InvalidOperationError } from "../errors";

export class StringTokenParser {
  public position: number = 0;
  private readonly _stateStack: number[] = [];
  public constructor(public readonly source: string) {
  }
  public consumeString(needle: string, comparer?: EqualityComparer): boolean {
    return this._matchString(needle, comparer, true);
  }
  public consumeAnyString(needles: Iterable<string>, comparer?: EqualityComparer): string | undefined {
    return this._matchAnyString(needles, comparer, true);
  }
  public consumeRegExp(needle: RegExp): RegExpExecArray | RegExpMatchArray | undefined {
    return this._matchRegExp(needle, true);
  }
  public peekString(needle: string, comparer?: EqualityComparer): boolean {
    return this._matchString(needle, comparer, false);
  }
  public peekAnyString(needles: Iterable<string>, comparer?: EqualityComparer): string | undefined {
    return this._matchAnyString(needles, comparer, false);
  }
  public peekRegExp(needle: RegExp): RegExpExecArray | RegExpMatchArray | undefined {
    return this._matchRegExp(needle, false);
  }
  // state stack
  public pushState(): void {
    this._stateStack.push(this.position);
  }
  public popState(): void {
    if (!this._stateStack.length) throw new InvalidOperationError("Parser state stack is empty.");
    this.position = this._stateStack.pop()!;
  }
  public acceptState(): void {
    if (!this._stateStack.length) throw new InvalidOperationError("Parser state stack is empty.");
    this._stateStack.pop();
  }
  public checkStateStackEmpty(): void {
    if (this._stateStack.length) throw new InvalidOperationError("Parser state stack is not empty.");
  }
  // state
  public get isEof(): boolean {
    return this.position >= this.source.length;
  }
  private _matchString(needle: string, comparer: EqualityComparer | undefined, consume: boolean): boolean {
    const end = this.position + needle.length;
    if (end > this.source.length) return false;
    if (needle === "") return true;
    const substr = this.source.substring(this.position, end);
    if (comparer ? comparer.equals(substr, needle) : substr === needle) {
      if (consume) this.position = end;
      return true;
    }
    return false;
  }
  private _matchAnyString(needles: Iterable<string>, comparer: EqualityComparer | undefined, consume: boolean): string | undefined {
    for (const needle of needles) {
      if (this._matchString(needle, comparer, consume)) return needle;
    }
    return undefined;
  }
  private _matchRegExp(needle: RegExp, consume: boolean): RegExpExecArray | RegExpMatchArray | undefined {
    Diagnostics.assert(needle.flags.includes("y"));
    needle.lastIndex = this.position;
    const match = needle.exec(this.source);
    if (!match) return undefined;
    if (consume) this.position = needle.lastIndex;
    return match;
  }
}
