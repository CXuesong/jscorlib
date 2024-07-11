import { assert, fail, getObjectId } from "../../diagnostics";
import { SafeInteger } from "../../numbers";
import { isReferenceType, ReferenceType } from "../../types/referenceType";
import { OrdinalStringEqualityComparer } from "./strings";
import { EqualityComparer, EqualsSymbol, Equatable, GetHashCodeSymbol } from "./typing";

export class NumberEqualityComparer implements EqualityComparer<number> {
  public static readonly instance = new NumberEqualityComparer();
  private readonly _floatView = new Float64Array(1);
  private readonly _intView = new Uint32Array(this._floatView.buffer);
  public constructor() {
    assert(this._intView.length == 2);
  }
  public isSupported(value: unknown): value is number {
    return typeof value === "number";
  }
  public equals(x: number, y: number): boolean {
    // Handle NaN properly.
    // This also means we are distinguishing between +0 & -0
    // https://stackoverflow.com/questions/7223359/are-0-and-0-the-same
    return Object.is(x, y);
  }
  public getHashCode(value: number): SafeInteger {
    this._floatView[0] = value;
    return this._intView[0] ^ this._intView[1];
  }
}

export class BigIntEqualityComparer implements EqualityComparer<bigint> {
  public static readonly instance = new BigIntEqualityComparer();
  public isSupported(value: unknown): value is bigint {
    return typeof value === "bigint";
  }
  public equals(x: bigint, y: bigint): boolean {
    return x === y;
  }
  public getHashCode(value: bigint): SafeInteger {
    let cur = 0n;
    while (value) {
      cur ^= (value & 0xFF_FF_FF_FFn);
      value >>= 32n;
    }
    return Number(cur);
  }
}

export class BooleanEqualityComparer implements EqualityComparer<boolean> {
  public static readonly instance = new BooleanEqualityComparer();
  public isSupported(value: unknown): value is boolean {
    return typeof value === "boolean";
  }
  public equals(x: boolean, y: boolean): boolean {
    return x === y;
  }
  public getHashCode(value: boolean): SafeInteger {
    return value ? 1 : 0;
  }
}

export class DateEqualityComparer implements EqualityComparer<Date> {
  public static readonly instance = new DateEqualityComparer();
  public isSupported(value: unknown): value is Date {
    return value instanceof Date;
  }
  public equals(x: Date, y: Date): boolean {
    // Handle invalid date (NaN) properly.
    return Object.is(x.getTime(), y.getTime());
  }
  public getHashCode(value: Date): SafeInteger {
    // The maximum timestamp representable by a Date object is slightly smaller than the maximum safe integer
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#the_epoch_timestamps_and_invalid_date
    return value ? 1 : 0;
  }
}

const globalSymbolHashes = new Map<symbol, SafeInteger>();

export class ReferenceTypeEqualityComparer implements EqualityComparer<ReferenceType | null | undefined> {
  public static readonly instance = new ReferenceTypeEqualityComparer();
  public isSupported(value: unknown): value is ReferenceType | null | undefined {
    return value == null || isReferenceType(value);
  }
  public equals(x: ReferenceType | null | undefined, y: ReferenceType | null | undefined): boolean {
    if (isEquatableWithHashCode(x) && isEquatableWithHashCode(y)) return x[EqualsSymbol](y);
    return Object.is(x, y);
  }
  public getHashCode(value: ReferenceType | null | undefined): SafeInteger {
    // null
    if (!value) return 0;
    if (isEquatableWithHashCode(value)) return value[GetHashCodeSymbol]();
    if (typeof value === "symbol" && Symbol.keyFor(value) != null) {
      // getObjectId is not applicable to shared symbols.
      let hash = globalSymbolHashes.get(value);
      if (hash == null) {
        hash = globalSymbolHashes.size + 1;
        globalSymbolHashes.set(value, hash);
      }
      return hash;
    }
    return getObjectId(value);
  }
}

export class AnyValueEqualityComparer implements EqualityComparer<unknown> {
  public static readonly instance = new AnyValueEqualityComparer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public isSupported(value: unknown): value is any {
    return true;
  }
  public equals(x: unknown, y: unknown): boolean {
    if (Object.is(x, y)) return true;

    switch (typeof x) {
      case "string":
        if (typeof y !== "string") return false;
        return OrdinalStringEqualityComparer.instance.equals(x, y);
      case "number":
        if (typeof y !== "number") return false;
        return NumberEqualityComparer.instance.equals(x, y);
      case "bigint":
        if (typeof y !== "bigint") return false;
        return BigIntEqualityComparer.instance.equals(x, y);
      case "boolean":
        if (typeof y !== "boolean") return false;
        return BooleanEqualityComparer.instance.equals(x, y);
      case "object":
        if (x instanceof Date) {
          if (!(y instanceof Date)) return false;
          return DateEqualityComparer.instance.equals(x, y);
        }
        if (!x) return false;   // y is not null (but can be undefined)
        if (typeof y !== "object") return false;
        return ReferenceTypeEqualityComparer.instance.equals(x, y);
      case "symbol":
        if (typeof y !== "symbol") return false;
        return ReferenceTypeEqualityComparer.instance.equals(x, y);
      case "function":
        if (typeof y !== "function") return false;
        return ReferenceTypeEqualityComparer.instance.equals(x, y);
    }
    fail("Unexpected value type. Unable to check equality.");
    return false;
  }
  public getHashCode(value: unknown): SafeInteger {
    if (value == null) return 0;
    switch (typeof value) {
      case "string":
        return OrdinalStringEqualityComparer.instance.getHashCode(value);
      case "number":
        return NumberEqualityComparer.instance.getHashCode(value);
      case "bigint":
        return BigIntEqualityComparer.instance.getHashCode(value);
      case "boolean":
        return BooleanEqualityComparer.instance.getHashCode(value);
      case "object":
        if (value instanceof Date) return DateEqualityComparer.instance.getHashCode(value);
        return ReferenceTypeEqualityComparer.instance.getHashCode(value);
      case "symbol":
      case "function":
        return ReferenceTypeEqualityComparer.instance.getHashCode(value);
    }
    fail("Unexpected value type. Unable to generate hash code.");
    return 0;
  }
}

function isEquatableWithHashCode(value: unknown): value is Equatable & { [GetHashCodeSymbol]: object } {
  if (!value) return false;
  const e = value as Equatable;
  assert(
    (typeof e[EqualsSymbol] === "function") === (typeof e[GetHashCodeSymbol] === "function"),
    "Incorrectly implemented Equatable interface for hash code generation: Both [[EqualsSymbol]] and [[GetHashCodeSymbol]] should be implemented.",
  );
  return typeof e[EqualsSymbol] === "function" && typeof e[GetHashCodeSymbol] === "function";
}
