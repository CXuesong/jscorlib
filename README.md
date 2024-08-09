# jscorlib packages [WIP]

a set of JS helpers inspired by [.NET BCL](https://learn.microsoft.com/en-us/dotnet/standard/class-library-overview), [TC 39 drafts](https://github.com/tc39/proposals?tab=readme-ov-file), and more, which hopefully reduces repetitive work by filling the gaps in the native JavaScript API.

This set of packages are still in v0 phase. While you are welcome to play with them experimentally, and filing bugs and/or ideas, they are _not_ intended for consumption in your Production projects. Because APIs and implementations are subject to drastic changes.

The entry-point package of the library is [`jscorlib`](./packages/jscorlib/).

## See also

* Npm
    * [jscorlib](https://www.npmjs.com/package/jscorlib) | ![NPM Version](https://img.shields.io/npm/v/jscorlib) ![NPM Downloads](https://img.shields.io/npm/dw/jscorlib)
    * [@jscorlib/polyfills](https://www.npmjs.com/package/@jscorlib/polyfills) | ![NPM Version](https://img.shields.io/npm/v/%40jscorlib%2Fpolyfills) ![NPM Downloads](https://img.shields.io/npm/dw/%40jscorlib%2Fpolyfills)
* [Library landing page](https://cxuesong.github.io/jscorlib/)
* [API documentation](https://cxuesong.github.io/jscorlib/docs/latest/)

## Design concepts

This set of packages implements APIs (or, "helpers") of various aspects (e.g., strings, arrays, iterators, globalization). To reduce the extraneous dependencies, the packages are designed to be as self-contained as possible. At least we are not depending on [is-number](https://www.npmjs.com/package/is-number) _lol_

While this set of libraries intends to be consumed in the browsers, they should also be able to be consumed in nodejs without much difficulty.

* Packages in this repo are declared as ESM. There won't be CommonJS support in this repo.
* Packages in this repo are following best practices that help bundlers (e.g., Webpack / Vite / etc.) to achieve more effective tree-shaking.

This set of libraries intends to adopt the cutting-edge ECMAScript standard in an aggressive but slightly practical way.

* Packages in this repo are currently using ES2022 language features and ESNext module mode when transpiling the JS files for publishing. The language version might be furtherly upgraded in future.
    * If you want backward compatibility in ECMAScript version, feel free to process the transpiled JS files provided in the packages once more, either with `typescript`, `babel`, or similar transpilers or bundlers.
    * Module bundlers such as `webpack`, `vite`, `esbuild`, of latest versions, should be supporting bundling the latest language mode automatically. They are also providing options for you to specify output language versions.
* Packages in this repo are leverage latest browser APIs + [TC 39 Stage 3 Proposals](https://tc39.es/#proposals).
    * There is a limited set of _loose_ polyfills for [TC 39 Stage 3 Drafts](https://tc39.es/process-document/) in [`@jscorlib/polyfills`](./packages/@jscorlib/polyfills/) package.
    * If you are building your own Web App, you can always choose your favorite polyfills to fill the gaps.

The point is: Instead of making the decisions for you, we are providing you with the possibilities, by allowing you to postprocess the code from our libraries as you wish, because

1. It is relatively easy to transpile new ECMA syntaxes into old ones, while its reverse is way to difficult.
2. It is relatively easy to select and install polyfills in the end-user projects (such as a Web App), depending on the target platforms. Had we already packed all the polyfills inside our libraries, it would have been difficult to remove them. Unnecessary polyfills will bloat up your Web App and can cause compatibility issue, when built-in implementation is already available, or when there are multiple polyfills installed for the same API.
