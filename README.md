# @dojo/cli-build-app

[![Build Status](https://travis-ci.org/dojo/cli-build-app.svg?branch=master)](https://travis-ci.org/dojo/cli-build-app)
[![Build status](https://ci.appveyor.com/api/projects/status/31du0respjt6p98i/branch/master?svg=true)](https://ci.appveyor.com/project/Dojo/cli-build-app/branch/master)
[![codecov](https://codecov.io/gh/dojo/cli-build-app/branch/master/graph/badge.svg)](https://codecov.io/gh/dojo/cli-build-app)
[![npm version](https://badge.fury.io/js/%40dojo%2Fcli-build-app.svg)](https://badge.fury.io/js/%40dojo%2Fcli-build-app)

The official CLI command for building Dojo 2 applications.

- [Usage](#usage)
- [Features](#features)
  - [Building](#building)
  - [Serving](#serving-the-application)
  - [Watching](#watching)
  - [Eject](#eject)
  - [Configuration](#configuration)
- [How do I contribute?](#how-do-i-contribute)
  - [Installation](#installation)
  - [Testing](#testing)
- [Licensing information](#licensing-information)

## Usage

To use `@dojo/cli-build-app` in a single project, install the package:

```bash
npm install @dojo/cli-build-app
```

## Features

`@dojo/cli-build-app` is a command for the [`@dojo/cli`](https://github.com/dojo/cli).

### Building

There are three modes available to build a Dojo 2 application, `dist`, `dev` and `test`. The mode required can be passed using the `--mode` flag:

```bash
dojo build app --mode dist
```

The built application files are written to the `output/{mode selected}` directory

Note: `dist` is the default mode and so can be run without any arguments, `dojo build app`.

#### Dist Mode

The `dist` mode creates a production-ready build.

#### Dev mode

The `dev` mode creates an application build that has been optimized for debugging and development.

#### Test mode

The `test` mode creates bundles that can be used to run the unit and functional tests of the application.

### Serving the Application

A web server can be started with the `--serve` flag while running in `dev` or `dist` modes. By default, the application is served on port 9999, but this can be changed with the `--port` (`-p`) flag:

```bash
# build once and then serve the app on port 3000
dojo build -s -p 3000
```

### Watching

Building with the `--watch` option observes the file system for changes, and recompiles to the appropriate `output/{dist|dev|test}` directory, depending on the current `--mode`. When used in the conjunction with the `--serve` option and `--mode=dev`, `--watch=memory` can be specified to enable automatic browser updates and hot module replacement (HMR).

```bash
# start a file-based watch
dojo build -w

# build to an in-memory file system with HMR
dojo build -s -w=memory -m=dev
```

### Eject

Ejecting `@dojo/cli-build-app` will produce the following files under the `config/build-app` directory:

- `build-options.json`: the build-specific config options removed from the `.dojorc`
- `ejected.config.js`: the root webpack config that passes the build options to the appropriate mode-specific config based on the `--env.mode` flag's value.
- `base.config.js`: a common configuration used by the mode-specific configs.
- `dev.config.js`: the configuration used during development.
- `dist.config.js`: the production configuration.
- `test.config.js`: the configuration used when running tests.

As already noted, the dojorc's `build-app` options are moved to `config/build-app/build-options.json` after ejecting. Further, the modes are specified using webpack's `env` flag (e.g., `--env.mode=dev`), defaulting to `dist`. You can run a build using webpack with:

```bash
node_modules/.bin/webpack --config=config/build-app/ejected.config.js --env.mode={dev|dist|test}
```

### Configuration

Applications use a `.dojorc` file at the project root to control various aspects of development such as testing and building. This file, if provided, MUST be valid JSON, and the following options can be used beneath the `"build-app"` key:

#### `bundles`: object

Useful for breaking an application into smaller bundles, the `bundles` option is a map of webpack bundle names to arrays of modules that should be bundled together. For example, with the following configuration, both `src/Foo` and `src/Bar` will be grouped in the `foo.[hash].js` bundle.

Widget modules defined used with `w()` will be automatically converted to a lazily imported, local registry item in the parent widget. This provides a mechanism for declarative code splitting in your application.

```
{
	"build-app": {
		"bundles": {
			"foo": [
				"src/Foo",
				"src/Bar"
			]
		}
	}
}
```

#### `cldrPaths`: string[]

An array of paths to [CLDR JSON](https://github.com/dojo/i18n#loading-cldr-data) files. Used in conjunction with the `locale` and `supportedLocales` options (see below). If a path contains the string `{locale}`, that file will be loaded for each locale listed in the `locale` and `supportedLocales` properties. For example, with the following configuration the `numbers.json` file will be loaded for the "en", "es", and "fr" locales:

```
{
	"build-app": {
		"locale": "en",
		"supportedLocales": [ "es", "fr" ]
		"cldrPaths": [
			"cldr-data/main/{locale}/numbers.json"
		]
	}
}
```

#### `features`: object

A map of [`has`](https://github.com/dojo/has/) features to boolean flags that can be used when building in `dist` mode to remove unneeded imports or conditional branches. See the [`static-build-loader`](https://github.com/dojo/webpack-contrib/#static-build-loader) documentation for more information.

#### `locale`: string

The default locale for the application. When the application loads, the root locale is set to the user's locale if it supported (see below), or to the default `locale` as a fallback.

#### `publicDirName`: string

The name of an optional, top-level public directory that will be copied as-is (without file hashing) to the output directory. Must be a sibling to `src/`. Defaults to "public".

#### `pwa`: object

A parent map that houses settings specific to creating progressive web applications.

#### `pwa.manifest`: object

Specifies information for a [web app manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest). If provided, the following `<meta>` tags are injected into the application's `index.html`:

- `mobile-web-app-capable="yes"`: indicates to Chrome on Android that the application can be added to the user's homescreen.
- `apple-mobile-web-app-capable="yes"`: indicates to iOS devices that the application can be added to the user's homescreen.
- `apple-mobile-web-app-status-bar-style="default"`: indicates to iOS devices that the status bar should use the default appearance.
- `apple-touch-icon="{{icon}}"`: the equivalent of the manifests' `icons` since iOS does not currently read icons from the manifest. A separate meta tag is injected for each entry in the `icons` array.

For example:

```
{
	"build-app": {
		"pwa": {
			"manifest": {
				"name": "Todo MVC",
				"description": "A simple to-do application created with Dojo 2",
				"icons": [
					{ "src": "./favicon-16x16.png", "sizes": "16x16", "type": "image/png" },
					{ "src": "./favicon-32x32.png", "sizes": "32x32", "type": "image/png" },
					{ "src": "./favicon-48x48.png", "sizes": "48x48", "type": "image/png" },
					{ "src": "./favicon-256x256.png", "sizes": "256x256", "type": "image/png" }
				]
			}
		}
	}
}
```

#### `pwa.serviceWorker`: object

Generates a fully-functional service worker that is activated on startup, complete with precaching and custom route handling. Alternatively, you can create your own service worker file and `@dojo/cli-build-app` will ensure it is copied to the correct output directory. Under the hood, the `ServicerWorkerPlugin` from `@dojo/webpack-contrib` is used to generate the service worker, and [all of its options](https://github.com/dojo/webpack-contrib/#service-worker-plugin) are valid `pwa.serviceWorker` properties. Note that if `pwa.serviceWorker.cachePrefix` is not included, it defaults to the `name` property from the application's `package.json`.

```js
{
	"build-app": {
		"pwa": {
			"serviceWorker": {
				"cachePrefix": "my-app",

				// exclude the "admin" bundle from caching
				"excludeBundles": [ "admin" ],

				"routes": [
					// Use the cache-first strategy for loading images, adding them to the "my-app-images" cache.
					// Only the first ten images should be cached, and for one week.
					{
						"urlPattern": ".*\\.(png|jpg|gif|svg)",
						"strategy": "cacheFirst",
						"cacheName": "my-app-images",
						"expiration": { "maxEntries": 10, "maxAgeSeconds": 604800 }
					},

					// Use the cache-first strategy to cache up to 25 articles that expire after one day.
					{
						"urlPattern": "http://my-app-url.com/api/articles",
						"strategy": "cacheFirst",
						"expiration": { "maxEntries": 25, "maxAgeSeconds": 86400 }
					}
				]
			}
		}
	}
}
```

#### `build-time-render`: object

Renders the application to HTML during the build and in-lines the critical CSS. This allows the application to effectively render static HTML pages and provide some advantages of SSR (server side rendering) such as performance, SEO etc without the complexities of running a server to support full SSR.

 * root (required) : The `id` of the root DOM node that application `merge` onto.
 * paths (optional): An array of hash routes to render the application for during the build, for more complex routes an object can be provided with a basic "matcher" (regular expression) that is used to match against the applications route on page load. *Only supports hash routing.*

```json
{
	"build-app": {
		"build-time-render": {
			"root": "app",
			"paths": [
				"#home",
				{
					"path": "#comments/9999",
					"match": [ "#comments\/.*" ]
				}
			]
		}
	}
}
```

Build time rendering exposes a `has` flag `build-time-render` that can be used to skip functionality that cannot be executed at build time, for example fetching external data.

```ts
if (!has('build-time-render')) {
	fetch( /* ... */ );
}
```

**Note:** The application needs to use the `merge` API from `Projector`

#### `supportedLocales`: string[]

An array of supported locales beyond the default. When the application loads, the user's locale is checked against the list of supported locales. If the user's locale is compatible with the supported locales, then the user's locale is used throughout the application. Otherwise, the default `locale` is used. For example, with the following configuration, the application locale will be set to Pashto or Arabic if either is listed as the user's locale, with Farsi used as the default.

Example:

```
{
	"build-app": {
		"locale": "fa",
		"supportedLocales": [ "ps", "ar" ],
		"compression": "gzip",
		"bundles": {
			"widgets": [
				"src/widgets/Header",
				"src/widgets/Footer"
			]
		}
	}
}
```

## How do I contribute?

We appreciate your interest! Please see the [Dojo 2 Meta Repository](https://github.com/dojo/meta#readme) for the Contributing Guidelines. This repository uses [prettier](https://prettier.io/) for code style and is configured with a pre-commit hook to automatically fix formatting issues on staged `.ts` files before performing the commit.

### Installation

To start working with this package, clone the repository and run `npm install`.

In order to build the project run `grunt dev` or `grunt dist`.

### Scripts

#### test

Builds a new test artifact from the repository source code and re-installs the `test-app` dependencies before running all unit and functional tests.

#### build-test-artifact

Builds and packages `cli-build-app` as `dojo-cli-build-app.tgz` in the `dist` directory.

#### generate-fixtures

Re-generates the test fixtures in `test-app`. Assumes that the dependencies have been installed for the test app.

#### prettier

Runs [prettier](https://prettier.io/) on all `.ts` files in the `src` and `tests` directories, this will fix any detected code style violations.

### Testing

Test cases MUST be written using [Intern](https://theintern.github.io) using the BDD test interface and Assert assertion interface.

90% branch coverage MUST be provided for all code submitted to this repository, as reported by istanbul’s combined coverage results for all supported platforms.

The command is tested by running via the Dojo CLI and asserting the build output against known fixtures. To do this, a test artifact needs to be built and installed into the `test-app`:

```
npm test
```

Once the test artifact has been installed, if there have been no changes to the command code `grunt test` can be used to repeat the tests.

## Licensing information

© 2018 [JS Foundation](https://js.foundation/). [New BSD](http://opensource.org/licenses/BSD-3-Clause) license.
