/**
 * Contains a set of functions implementing [LINQ-like](https://learn.microsoft.com/en-us/dotnet/api/system.linq)
 * chained extension methods that helps you evaluate on a sequence of element efficiently & elegantly.
 * 
 * @see [TC 39 Stage 3 Draft: Iterator Helpers](https://tc39.es/proposal-iterator-helpers/)
 * 
 * @module
 */
export * from "./aggregate";
export * from "./anyAll";
export * from "./chunk";
export * from "./collect";
export * from "./collectHashMap";
export * from "./collectHashSet";
export * from "./count";
export * from "./distinct";
export * from "./forEach";
export * from "./groupBy";
export * from "./linqWrapper";
export * from "./minmax";
export * from "./pick";
export * from "./reverse";
export * from "./select";
export * from "./sort";
export * from "./traits";
export * from "./typing";
export * from "./where";
export * from "./zip";
