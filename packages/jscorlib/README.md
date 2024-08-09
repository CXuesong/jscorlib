# jscorlib

a set of JS helpers inspired by [.NET BCL](https://learn.microsoft.com/en-us/dotnet/standard/class-library-overview), [TC 39 drafts](https://github.com/tc39/proposals?tab=readme-ov-file), and more, which hopefully reduces repetitive work by filling gaps in the native JavaScript API.

This is the entry-point package of the `jscorlib` library.

This package is an ESM package that has been transpiled with ES2022 language target. Please transpile the JS files once more and/or apply polyfills as your compatibility need, if you are the end-user of the package.

This package is tree-shakable.

This package contains core functionalities that extends JS API for a bit, including

* helpers for built-in JS types, such as `string` / `Array` / `Number` / `Promise`
* abstrations of comparers & equality comparers
* `Lazy` & `AsyncLazy` containers
* debug-time assertion, object ID, customizable inspection message
* strong-typed common `Error` sub-classes
* `EventEmitter` supporting synchronous & asynchronous handlers
* basic globalization conventions (e.g. invariant locale)
* strong-typed `HttpRequestError`, and a factory function that takes `Response` as input
* `LINQ`-like chainable "Fluent" syntax for querying over any `Iterable`
* an asynchronous `Semaphore` that has been long existing in native languages, which does not make any sense in JS until asynchronous functions are introduced
* a very simple runtime type system based on `typeof` operator and object "prototype holders"

For details, please refer to the API documentation of the package.
