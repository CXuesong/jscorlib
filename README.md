# jscorlib libraries [WIP]

a set of JS helpers inspired by .NET BCL, TC 39 drafts, and more, hopefully filling some of the gaps in native JavaScript API.

While this set of libraries intend to be consumed in the browsers, they should also be able to be consumed in nodejs. This means

* packages in this repo are declared as ESM. There won't be CommonJS support in this repo.
* packages in this repo are following best practices that help bundlers (e.g., Webpack / Vite / etc.) to achieve more effective tree-shaking.

This set of packages intend to adopt the cutting-edge ECMAScript standard in an aggressive but slightly practical way. This means
* packages in this repo are currently using ES2022 language mode and ESNext module mode when transpiling the JS files. The language version might also upgrade in future.
    * If you want language version backward compatibility, feel free to process the transpiled JS files provided in the packages once more, either with `typescript`, `babel`, or similar transpilers or bundlers.
* packages in this repo are leverage existing browser APIs + [TC 39 Stage 3 Proposals](https://tc39.es/#proposals).
    * There is a limited set of _loose_ polyfills for [TC 39 Stage 3 Drafts](https://tc39.es/process-document/) in `@jscorlib/polyfills` package. By "loose" it means the polyfills will mostly work on the happy path. Errors thrown from these polyfills may be different from the spec. Behaviors in the corner cases may also be different from the spec.
    * as a downstream consumer, such as WebApp builder, you can always choose your favorite polyfills to fill the gaps, if necessary.

The point is: Instead of making the decisions for you, we are providing you with the possibilities, by allowing you to postprocess the code from our libraries as your wish, because

1. It is relatively easy to transpile new ECMA syntaxes into old ones, while its reverse is way to difficult.
2. It is relatively easy to select and install polyfills in the end-user projects, depending on the target platforms, but had we already packed all the polyfills inside our libraries, it will be difficult to remove them. Unnecessary polyfills will bloat up your Web App and can cause compatibility issue, in the case when built-in implementation is already available, or there are multiple polyfills to the same API.

This set of packages implement APIs (or, "helpers") of various aspects (e.g., strings, arrays, iterators, globalization) that should make the packages self-consistent, and thus their dependencies as clean as possible. For example, packages _published_ from this repo are not depending on [is-number](https://www.npmjs.com/package/is-number) _lol_
