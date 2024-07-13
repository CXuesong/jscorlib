/**
 * Contains a set of functions implementing [LINQ-like](https://learn.microsoft.com/en-us/dotnet/api/system.linq)
 * chained extension methods that helps you evaluate on a sequence of element efficiently & elegantly.
 * 
 * @module
 */
export * as Aggregate from "./aggregate";
export * as Chunk from "./chunk";
export * as Collect from "./collect";
export * as CollectHashMap from "./collectHashMap";
export * as CollectHashSet from "./collectHashSet";
export * as Count from "./count";
export * as Distinct from "./distinct";
export * as ForEach from "./forEach";
export * as GroupBy from "./groupBy";
export * from "./linqWrapper";
export * as MinMax from "./minmax";
export * as Pick from "./pick";
export * as Reverse from "./reverse";
export * as Select from "./select";
export * as Sort from "./sort";
export * from "./traits";
export * from "./typing";
export * as Where from "./where";
export * as Zip from "./zip";
