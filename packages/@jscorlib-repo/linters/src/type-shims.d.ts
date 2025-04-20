export { };

declare global {
  // This is to make "@typescript-eslint/no-base-to-string" rule work properly.
  // https://github.com/microsoft/TypeScript/issues/38347
  interface Boolean {
    toString(): string;
  }
  interface Error {
    toString(): string;
  }
}
