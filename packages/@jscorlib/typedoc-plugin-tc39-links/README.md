# @jscorlib/polyfills

a limited set of _loose_ polyfills for [TC 39 Stage 3 Drafts](https://tc39.es/process-document/) that might be consumed in `jscorlib` package.

By "loose" it means the polyfills will mostly work on the happy path. Errors thrown from these polyfills may be different from the spec. Behaviors in the corner cases may also be different from the spec.

This package is an ESM package that has been transpiled with ES2022 language target. Please transpile the JS files once more and/or apply polyfills as your compatibility need, if you are the end-user of the package.

This package is tree-shakable.

For details, please refer to the API documentation of the package.
