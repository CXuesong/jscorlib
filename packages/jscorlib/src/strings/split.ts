import { assert } from "../diagnostics";
import { ArgumentRangeError, ArgumentTypeError } from "../errors";
import { asSafeInteger, SafeInteger } from "../numbers";
import { CustomStringSplitDelimiter, SplitSymbol } from "./typing";

export interface StringSplitOptions {
  limit: SafeInteger | undefined;
}

/**
 * 
 * @param str 
 * @param delimiter 
 * @param limit 
 * 
 * @see [TC 39 Stage 1 Draft: Reversible string split](https://github.com/tc39/proposal-reversible-string-split)
 */
export function split(str: string, delimiter: string | RegExp | CustomStringSplitDelimiter, limit?: SafeInteger): string[];
export function split(str: string, delimiter: string | RegExp | CustomStringSplitDelimiter, options?: StringSplitOptions): string[];
export function split(str: string, delimiter: string | RegExp | CustomStringSplitDelimiter, arg2?: SafeInteger | StringSplitOptions): string[] {
  let limit = typeof arg2 === "object" ? arg2.limit : arg2;
  if (limit != null) {
    limit = asSafeInteger(limit);
    if (limit < 0) throw ArgumentRangeError.create(2, typeof arg2 === "object" ? "options" : "limit", "limit should be a non-negative integer.");
  }

  if (typeof delimiter === "string") {
    // Trivial
    if (limit == null) return str.split(delimiter);
    if (limit === 0) return [];
    if (limit === 1) return [str];
    if (!str) return [""];

    return splitByString(str, delimiter, limit);
  }

  if (delimiter && SplitSymbol in delimiter && typeof delimiter[SplitSymbol] === "function") {
    return delimiter[SplitSymbol](str, { limit });
  }

  if (delimiter instanceof RegExp) {
    // Trivial
    if (limit == null) return str.split(delimiter);
    if (limit === 0) return [];
    if (limit === 1) return [str];
    if (!str) return [""];

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/@@split#description
    let flagsOverride = delimiter.flags;
    if (flagsOverride.includes("y")) flagsOverride = flagsOverride.replaceAll("y", "");
    if (!flagsOverride.includes("g")) flagsOverride += "g";
    if (flagsOverride !== delimiter.flags) delimiter = new RegExp(delimiter.source, flagsOverride);

    return splitByRegExp(str, delimiter, limit);
  }

  throw ArgumentTypeError.create(1, "delimiter", "delimiter should either be a string, RegExp, or an object implementing CustomStringSplitDelimiter.");
}

function splitByString(str: string, delimiter: string, limit: number): string[] {
  if (delimiter) {
    const result: string[] = [];
    let curIndex = 0;
    let matchIndex;
    while ((matchIndex = str.indexOf(delimiter, curIndex)) >= 0) {
      result.push(str.substring(curIndex, matchIndex));
      curIndex = matchIndex + delimiter.length;
      if (result.length + 1 >= limit) break;
    }
    result.push(str.substring(curIndex));
    return result;
  }

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split#description
  // If separator is an empty string (""), str is converted to an array of each of its UTF-16 "characters",
  // without empty strings on either ends of the resulting string.
  const result = str.split("", limit);
  // str length > 1; limit > 1
  assert(result.length >= 1);
  assert(str.length >= result.length);
  if (str.length > result.length) {
    // replace the last part with the rest of the string (by UTF-16 chars)
    result[result.length - 1] = str.substring(result.length - 1);
  }

  return result;
}

function splitByRegExp(str: string, delimiter: RegExp, limit: number): string[] {
  assert(delimiter.flags.includes("g") && !delimiter.flags.includes("y"));

  const result: string[] = [];
  let curIndex = 0;
  delimiter.lastIndex = 0;
  let match;
  if (delimiter.flags.includes("u")) {
    // Advance 1 Unicode code point upon empty match.
    let strIt: Iterator<string> | undefined;
    while ((match = delimiter.exec(str))) {
      assert(match.index <= delimiter.lastIndex);
      if (delimiter.lastIndex === match.index) {
        // Empty match. We need to advance 1 Unicode code point.
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/@@iterator#manually_hand-rolling_the_iterator
        if (!strIt) {
          strIt = str.substring(curIndex)[Symbol.iterator]();
        }
        const itR = strIt.next();
        if (itR.done) {
          // No more chars. We are already at the end of string.
          strIt = undefined;
          // There is nothing left in the string so just return without appending "rest" part.
          return result;
        }
        result.push(itR.value);
        curIndex += itR.value.length;
        delimiter.lastIndex += itR.value.length;
      } else {
        if (strIt) {
          // Invalidate previous iterator for manual advancing. We have already matched something.
          strIt.return?.();
          strIt = undefined;
        }

        result.push(str.substring(curIndex, match.index));
        curIndex = delimiter.lastIndex;
      }
      if (result.length + 1 >= limit) break;
    }
    if (strIt) {
      strIt.return?.();
      strIt = undefined;
    }
  } else {
    // Advance 1 UTF-16 code point upon empty match.
    while ((match = delimiter.exec(str))) {
      assert(match.index <= delimiter.lastIndex);
      if (delimiter.lastIndex === match.index) {
        // Empty match. We need to advance 1 UTF-16 char.
        if (curIndex >= str.length) {
          // No more chars. We are already at the end of string.
          // There is nothing left in the string so just return without appending "rest" part.
          return result;
        }
        result.push(str[curIndex]);
        curIndex++;
        delimiter.lastIndex++;
      } else {
        result.push(str.substring(curIndex, match.index));
        curIndex = delimiter.lastIndex;
      }
      if (result.length + 1 >= limit) break;
    }
  }
  result.push(str.substring(curIndex));
  return result;
}
