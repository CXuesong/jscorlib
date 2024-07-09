import { assert, getObjectId } from "../../diagnostics";
import { SafeInteger } from "../../numbers";
import { ReferenceType } from "../../types/referenceType";
import { EqualityComparer } from "./typing";

export class NumberEqualityComparer implements EqualityComparer<number> {
  public static readonly instance = new NumberEqualityComparer();
  private readonly _floatView = new Float64Array(1);
  private readonly _intView = new Uint32Array(this._floatView.buffer);
  public constructor() {
    assert(this._intView.length == 2);
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
  public equals(x: boolean, y: boolean): boolean {
    return x === y;
  }
  public getHashCode(value: boolean): SafeInteger {
    return value ? 1 : 0;
  }
}

export class DateEqualityComparer implements EqualityComparer<Date> {
  public static readonly instance = new DateEqualityComparer();
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

export class ReferenceTypeEqualityComparer implements EqualityComparer<ReferenceType> {
  public static readonly instance = new ReferenceTypeEqualityComparer();
  public equals(x: ReferenceType, y: ReferenceType): boolean {
    return x === y;
  }
  public getHashCode(value: ReferenceType): SafeInteger {
    // null
    if (!value) return 0;
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
