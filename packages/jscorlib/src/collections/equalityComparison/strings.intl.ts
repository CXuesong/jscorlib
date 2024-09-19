import { invariantCollator, invariantIgnoreCaseCollator } from "../comparison/internal/collators";
import { EqualityComparer } from "./typing";

// There is no hash function for locale-specific string comparison, for now.
export class InvariantLocaleStringEqualityComparer implements EqualityComparer<string> {
  public static readonly instance = new InvariantLocaleStringEqualityComparer();
  public equals(x: string, y: string): boolean {
    return invariantCollator.compare(x, y) === 0;
  }
  public isSupported(value: unknown): value is string {
    return typeof value === "string";
  }
}

export class InvariantLocaleIgnoreCaseStringEqualityComparer implements EqualityComparer<string> {
  public static readonly instance = new InvariantLocaleIgnoreCaseStringEqualityComparer();
  public equals(x: string, y: string): boolean {
    return invariantIgnoreCaseCollator.compare(x, y) === 0;
  }
  public isSupported(value: unknown): value is string {
    return typeof value === "string";
  }
}
