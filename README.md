[![checks](https://github.com/seaofvoices/generator-luau/actions/workflows/test.yml/badge.svg)](https://github.com/seaofvoices/generator-luau/actions/workflows/test.yml)
![version](https://img.shields.io/github/package-json/v/seaofvoices/generator-luau)
![GitHub top language](https://img.shields.io/github/languages/top/seaofvoices/generator-luau)
![license](https://img.shields.io/npm/l/generator-luau)
![npm](https://img.shields.io/npm/dt/generator-luau)

# generator-luau

A Yeoman generator for Luau projects.

This generator will setup a Luau project in no time. It will add all the necessary files to:

- publish the project on [npm](https://www.npmjs.com/)
- format your code with [stylua](https://github.com/JohnnyMorganz/StyLua)
- run code analysis with [Selene](https://github.com/Kampfkarren/selene) and [luau-lsp](https://github.com/JohnnyMorganz/luau-lsp)
- create Github actions:
    - to run tests
    - publish the package(s)
    - to create a new release and attach artifacts
- Run unit tests using [Jest](https://github.com/jsdotlua/jest-lua)
- Bundle your project into a single Lua file using [darklua](https://github.com/seaofvoices/darklua)
- Build your project into a Roblox model file using [rojo](https://github.com/rojo-rbx/rojo) (and [darklua](https://github.com/seaofvoices/darklua) to convert the requires!)
- add a license file (MIT, Apache, MPL and more)
- add other tools like [lune](https://github.com/lune-org/lune), [mantle](https://github.com/blake-mealey/mantle) or [tarmac](https://github.com/rojo-rbx/tarmac) to the [foreman.toml](https://github.com/Roblox/foreman) configuration file

## Installation

First, install [Yeoman](http://yeoman.io) and generator-luau using [npm](https://www.npmjs.com/) (we assume you have pre-installed [node.js](https://nodejs.org/)).

```bash
npm install -g yo
npm install -g generator-luau
```

Then generate your new project:

```bash
yo luau package-name
```

## License

This project is available under the MIT license. See [LICENSE.txt](LICENSE.txt) for details.
