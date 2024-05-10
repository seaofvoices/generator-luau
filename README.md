<div align="center">

[![checks](https://github.com/seaofvoices/generator-luau/actions/workflows/test.yml/badge.svg)](https://github.com/seaofvoices/generator-luau/actions/workflows/test.yml)
![version](https://img.shields.io/github/package-json/v/seaofvoices/generator-luau)
![GitHub top language](https://img.shields.io/github/languages/top/seaofvoices/generator-luau)
![license](https://img.shields.io/npm/l/generator-luau)
![npm](https://img.shields.io/npm/dt/generator-luau)

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/seaofvoices)

</div>

# generator-luau

A Yeoman generator for Luau projects.

This generator will setup a Luau project in no time. It will add all the necessary files to:

- publish the project on [npm](https://www.npmjs.com/)
- format your code with [StyLua](https://github.com/JohnnyMorganz/StyLua)
- run code analysis with [selene](https://github.com/Kampfkarren/selene) and [luau-lsp](https://github.com/JohnnyMorganz/luau-lsp)
- create Github actions:
    - to run tests
    - publish the package(s)
    - to create a new release and attach artifacts
- run unit tests using [Jest](https://github.com/jsdotlua/jest-lua)
- bundle your project into a single Lua file using [darklua](https://github.com/seaofvoices/darklua)
- build your project into a Roblox model file using [rojo](https://github.com/rojo-rbx/rojo) (and [darklua](https://github.com/seaofvoices/darklua) to convert the requires!)
- add a license file (MIT, Apache, MPL and more)
- add other tools like [lune](https://github.com/lune-org/lune), [mantle](https://github.com/blake-mealey/mantle) or [tarmac](https://github.com/rojo-rbx/tarmac) to the [foreman.toml](https://github.com/Roblox/foreman) configuration file

## Installation

First, install [Yeoman](http://yeoman.io) and generator-luau using [npm](https://www.npmjs.com/). If you do not have [node.js](https://nodejs.org/), install it.

```bash
npm install -g yo
npm install -g generator-luau
```

Then generate your new project:

```bash
yo luau package-name
```

## Why a project generator?

When working with Luau, a lot of different tools need to be setup. That involves various configuration files and scripts that may change slightly depending on the project.

Instead of creating various template projects with a lot of overlap (and having to maintain all of them), this generator will customize a project based on your answers to a set of questions.

## Good to Know

This project generator is slightly opinionated. It is a tool I use to create and maintain a lot of projects in parallel.

For that reason, some corners are cut short and questions are not asked to configure:

- code style
- linters
- test runners

It is also possible that the generator has not implemented certain combination of features:

- multi-package project only works with yarn

## Generated Content

### Configuration files

- a npm package with a `package.json`, a `.npmignore` (a `.yarnrc.yml` when using [yarn](https://yarnpkg.com/))
- Luau related (`.luau` and `.luau-analyze.json`)
- VS Code settings for [luau-lsp](https://github.com/JohnnyMorganz/luau-lsp)
- [darklua](https://github.com/seaofvoices/darklua) configurations
- commonly used repository files (`README.md`, `CODE_OF_CONDUCT.md`, `LICENSE.txt`, `CHANGELOG.md`)
- [selene](https://github.com/Kampfkarren/selene) configuration (`selene.toml`) and an additional `selene_defs.yml` to support `require` calls with strings.
- [StyLua](https://github.com/JohnnyMorganz/StyLua) configuration (`stylua.toml`) and `.styluaignore`
- a `foreman.toml` to install necessary tools with [Foreman](https://github.com/Roblox/foreman)

### Scripts

#### `prepare`

This script will run [`npmluau`](https://github.com/seaofvoices/npmluau) to create the necessary files that [`darklua`](https://github.com/seaofvoices/darklua) or [`lune`](https://github.com/lune-org/lune) need to understand the `node_modules` layout.

When using `npm`, this script is automatically executed after installing dependencies with `npm install`. When using `yarn`, this script must be called explicitly.

#### `lint`

Runs code analysis with [selene](https://github.com/Kampfkarren/selene) and [luau-lsp](https://github.com/JohnnyMorganz/luau-lsp). Those tools can be run individually with `lint:selene` and `lint:luau`.

#### `format`

Runs `stylua` on all the Luau files to format them.

#### `style-check`

Runs `stylua` on all the Luau files to verify that the code style is correct.

#### `build`

Build artifacts based on what was included.

#### `verify-pack`

Display in the output what files are going to be published.

### Github Workflows

The project will come with two github workflows included.

#### Tests

This workflow will:
- run code analysis tools ([`selene`](https://github.com/Kampfkarren/selene) and [`luau-lsp`](https://github.com/JohnnyMorganz/luau-lsp))
- verify the code format (with [`stylua`](https://github.com/JohnnyMorganz/StyLua))
- build a Roblox model artifact (if included)
- bundle the project in a single Lua file (if included)

#### Release

This workflow can be triggered manually via the GitHub interface. Go to the `Actions` tab, choose the workflow named `Release`. Click on the button named `Run workflow`. The interface will prompt for a version number (prefixed with `v`, such as `v0.1.0` or `v1.0.2`) and an optional commit ID (in case you would not want to create the release from the latest commit). If you have trouble triggering the workflow, take a look at this [GitHub article](https://docs.github.com/en/actions/using-workflows/manually-running-a-workflow).

The workflow will:
- publish the package to the npm registry
- create a new release on Github
- build artifacts (Roblox models and bundled Lua file) and attach them to the newly created GitHub release

Before triggering a release, make sure to bump the package version appropriately (if you are not familiar with semantic versioning, take a look at [semver.org](https://semver.org)). Also, do not forget to update the changelog.

## License

This project is available under the MIT license. See [LICENSE.txt](LICENSE.txt) for details.
