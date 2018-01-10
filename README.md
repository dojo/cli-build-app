# @dojo/cli-build-app

[![Build Status](https://travis-ci.org/dojo/cli-build.svg?branch=master)](https://travis-ci.org/dojo/cli-build-app)
[![Build status](https://ci.appveyor.com/api/projects/status/31du0respjt6p98i/branch/master?svg=true)](https://ci.appveyor.com/project/Dojo/cli-build-app/branch/master)
[![codecov](https://codecov.io/gh/dojo/cli-build-app/branch/master/graph/badge.svg)](https://codecov.io/gh/dojo/cli-build-app)
[![npm version](https://badge.fury.io/js/%40dojo%2Fcli-build-app.svg)](https://badge.fury.io/js/%40dojo%2Fcli-build-app)

The official CLI command for building Dojo 2 applications.

*WARNING* This is currently _alpha_ software. This is not yet production ready, so you should use at your own risk.

- [Usage](#usage)
- [Features](#features)
  - [Building](#building)
  - [Eject](#eject)
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

`@dojo/cli-build-app` is an optional command for the [`@dojo/cli`](https://github.com/dojo/cli).

### Building

There are three modes available to build a Dojo 2 application, `dist`, `dev` and `test`. The mode required can be passed using the `--mode` flag:

```bash
dojo build app --mode dist
```

The built application files are written to the `output/{mode selected}` directory

Note: `dist` is the default mode and so can be run without any arguments, `dojo build app`.

#### Dist Mode

The `dist` mode create a production ready build.

#### Dev mode

The `dev` mode creates an application build that has been optimized for debugging and development.

#### Test mode

The `test` mode creates bundles that can be used to run the unit and functional tests of the application.

### Serving the Application

A web server can be started with the `--serve` flag. By default, the application is served on port 9999, but this can be changed with the `--port` (`-p`) flag:

```bash
dojo build -s -p 3000 # serve the app on port 3000
```

### Watching

Building with the `--watch` option observes the file system for changes, and recompiles to the appropriate `output/{dist|dev|test}` directory, depending on the current `--mode`. When used in the conjunction with the `--serve` option and `--mode=dev`, `--watch=memory` can be specified to enable automatic browser updates and hot module replacement (HMR).

```bash
dojo build -w # start a file-based watch
dojo build -s -w=memory # build to an in-memory file system with HMR
```

### Eject

Eject is not currently supported by `cli-build-app`.

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

© 2017 [JS Foundation](https://js.foundation/). [New BSD](http://opensource.org/licenses/BSD-3-Clause) license.
