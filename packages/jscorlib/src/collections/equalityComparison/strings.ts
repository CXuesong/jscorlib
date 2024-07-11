import { SafeInteger } from "../../numbers";
import { EqualityComparer } from "./typing";

export class OrdinalStringEqualityComparer implements EqualityComparer<string> {
  public static readonly instance = new OrdinalStringEqualityComparer();
  public isSupported(value: unknown): value is string {
    return typeof value === "string";
  }
  public equals(x: string, y: string): boolean {
    return x === y;
  }
  public getHashCode(value: string): SafeInteger {
    // http://www.cse.yorku.ca/~oz/hash.html
    let hash = 5381;
    hash ^= value.length;
    for (let i = 0; i < value.length; i++) {
      hash = ((hash << 5) + hash) + value.charCodeAt(i); /* hash * 33 + c */
    }
    return hash;
  }
}

const CHAR_CODE_A = 65;
// const CHAR_CODE_Z = 90;
const CHAR_CODE_a = 97;
const CHAR_CODE_z = 122;

export class OrdinalIgnoreCaseStringEqualityComparer implements EqualityComparer<string> {
  public static readonly instance = new OrdinalIgnoreCaseStringEqualityComparer();
  public isSupported(value: unknown): value is string {
    return typeof value === "string";
  }
  public equals(x: string, y: string): boolean {
    if (x.length !== y.length) return false;
    for (let i = 0; i < x.length; i++) {
      let xv = x.charCodeAt(i);
      let yv = y.charCodeAt(i);
      if (xv === yv) continue;

      // Normalize charcode into upper-case
      if (xv >= CHAR_CODE_a && xv <= CHAR_CODE_z) xv -= (CHAR_CODE_a - CHAR_CODE_A);
      if (yv >= CHAR_CODE_a && yv <= CHAR_CODE_z) yv -= (CHAR_CODE_a - CHAR_CODE_A);
      if (xv != yv) return false;
    }
    return true;
  }
  public getHashCode(value: string): SafeInteger {
    // http://www.cse.yorku.ca/~oz/hash.html
    let hash = 5381;
    hash ^= value.length;
    for (let i = 0; i < value.length; i++) {
      let v = value.charCodeAt(i);
      if (v >= CHAR_CODE_a && v <= CHAR_CODE_z) v -= (CHAR_CODE_a - CHAR_CODE_A);
      hash = ((hash << 5) + hash) + v; /* hash * 33 + c */
    }
    return hash;
  }
}
