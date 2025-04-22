import { EqualityComparer } from "../collections/equalityComparison";
import { assert } from "../diagnostics";
import { InvalidOperationError } from "../errors";

/**
 * A helper class for parsing strings into tokens.
 * This class provides methods to consume or lookahead for specific pattern, with traceback support.
 * 
 * @experimental
 */
export class StringTokenParser {
  /** Current position in the source string. */
  public position: number = 0;
  private readonly _stateStack: number[] = [];
  /**
   * @param source The source string to be parsed.
   */
  public constructor(public readonly source: string) {
  }

  /**
   * Consumes the specified string if it matches the current position in the source.
   * Advances the position if the match is successful.
   * 
   * @param needle The string to match.
   * @param comparer An optional equality comparer for custom string comparison.
   * @returns `true` if the string was successfully consumed; otherwise, `false`.
   */
  public consumeString(needle: string, comparer?: EqualityComparer): boolean {
    return this._matchString(needle, comparer, true);
  }

  /**
   * Consumes the first matching string from the provided iterable if it matches the current position.
   * Advances the position if a match is found.
   * 
   * @param needles One or more strings to match.
   * @param comparer An optional equality comparer for custom string comparison.
   * @returns The matched string if successful; otherwise, `undefined`.
   */
  public consumeAnyString(needles: Iterable<string>, comparer?: EqualityComparer): string | undefined {
    return this._matchAnyString(needles, comparer, true);
  }

  /**
   * Consumes a regular expression match at the current position in the source.
   * Advances the position if the match is successful.
   * 
   * @param needle The regular expression to match. Must include the `y` (sticky) flag.
   * @returns The match result if successful; otherwise, `undefined`.
   */
  public consumeRegExp(needle: RegExp): RegExpExecArray | RegExpMatchArray | undefined {
    return this._matchRegExp(needle, true);
  }

  /**
   * Checks if the specified string matches the current position in the source without consuming it.
   * 
   * @param needle The string to match.
   * @param comparer An optional equality comparer for custom string comparison.
   * @returns `true` if the string matches; otherwise, `false`.
   */
  public peekString(needle: string, comparer?: EqualityComparer): boolean {
    return this._matchString(needle, comparer, false);
  }

  /**
   * Checks if any of the provided strings match the current position in the source without consuming it.
   * 
   * @param needles One or more strings to match.
   * @param comparer An optional equality comparer for custom string comparison.
   * @returns The matched string if successful; otherwise, `undefined`.
   */
  public peekAnyString(needles: Iterable<string>, comparer?: EqualityComparer): string | undefined {
    return this._matchAnyString(needles, comparer, false);
  }

  /**
   * Checks if a regular expression matches the current position in the source without consuming it.
   * 
   * @param needle The regular expression to match. Must include the `y` (sticky) flag.
   * @returns The match result if successful; otherwise, `undefined`.
   */
  public peekRegExp(needle: RegExp): RegExpExecArray | RegExpMatchArray | undefined {
    return this._matchRegExp(needle, false);
  }

  /**
   * Saves the current position in the source to the state stack.
   * 
   * @see {@link acceptState}
   * @see {@link popState}
   * @see {@link checkStateStackEmpty}
   */
  public pushState(): void {
    this._stateStack.push(this.position);
  }

  /**
   * Restores the last saved position from the state stack.
   * This backtracks the parser to the last saved state.
   * 
   * @throws {InvalidOperationError} If the state stack is empty.
   * @see {@link pushState}
   * @see {@link acceptState}
   */
  public popState(): void {
    if (!this._stateStack.length) throw new InvalidOperationError("Parser state stack is empty.");
    this.position = this._stateStack.pop()!;
  }

  /**
   * Removes the last saved position from the state stack without restoring it.
   * 
   * @throws {InvalidOperationError} If the state stack is empty.
   */
  public acceptState(): void {
    if (!this._stateStack.length) throw new InvalidOperationError("Parser state stack is empty.");
    this._stateStack.pop();
  }

  /**
   * Checks if the state stack is empty. Throws an Error if not.
   * 
   * @throws {InvalidOperationError} If the state stack is not empty.
   * @remarks
   * This method is useful for ensuring that all states have been accepted or popped before finalizing the parsing process.
   * @see {@link pushState}
   */
  public checkStateStackEmpty(): void {
    if (this._stateStack.length) throw new InvalidOperationError("Parser state stack is not empty.");
  }

  /**
   * Indicates whether the parser has reached the end of the source string.
   * 
   * @returns `true` if the current position is at or beyond the end of the source; otherwise, `false`.
   */
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
    assert(needle.flags.includes("y"));
    needle.lastIndex = this.position;
    const match = needle.exec(this.source);
    if (!match) return undefined;
    if (consume) this.position = needle.lastIndex;
    return match;
  }
}
