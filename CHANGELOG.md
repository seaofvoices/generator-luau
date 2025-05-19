# Changelog

- fix Roblox build script when using npm as the package manager ([#40](https://github.com/seaofvoices/generator-luau/pull/40))
- upgrade generated github action versions (`setup-node`, `upload-artifact` and switch `setup-foreman` for `CompeyDev/setup-rokit`) ([#39](https://github.com/seaofvoices/generator-luau/pull/39))

## 0.1.5

- add lune package aliases to configuration files ([#35](https://github.com/seaofvoices/generator-luau/pull/35))
- fix luau-lsp analysis script to ignore node_modules ([#30](https://github.com/seaofvoices/generator-luau/pull/30))
- fix incorrect extension name used in `roblox-test.sh` script ([#33](https://github.com/seaofvoices/generator-luau/pull/33))
- avoid including dev-dependencies when building Roblox models ([#32](https://github.com/seaofvoices/generator-luau/pull/32))

## 0.1.4

- fix `build` script usage in workflows where no artifacts are actually built (in both the `test` and `release` workflows) ([#28](https://github.com/seaofvoices/generator-luau/pull/28))
- remove `temp` directory after build scripts are done ([#27](https://github.com/seaofvoices/generator-luau/pull/27))
- add GitHub actions and selene to recommended VSCode extensions ([#26](https://github.com/seaofvoices/generator-luau/pull/26))
- disable luau-lsp automatic Rojo sourcemap generation setting ([#25](https://github.com/seaofvoices/generator-luau/pull/25))

## 0.1.3

- fix prepare command and usages of yarn when npm is selected ([#16](https://github.com/seaofvoices/generator-luau/pull/16))

## 0.1.2

- remove the scope prefix from package names in generated READMEs and the built artifacts ([#13](https://github.com/seaofvoices/generator-luau/pull/13))
- fix duplicated extensions in build artifacts file names ([#12](https://github.com/seaofvoices/generator-luau/pull/12))
- fix `build-roblox-asset.sh` script ([#11](https://github.com/seaofvoices/generator-luau/pull/11))
- fix `remove-tests.sh` script to support both `lua` and `luau` extensions ([#10](https://github.com/seaofvoices/generator-luau/pull/10))
- move Roblox `test-place.rbxl` file into the `temp` directory ([#9](https://github.com/seaofvoices/generator-luau/pull/9))

## 0.1.1

- rename gitignore, gitattributes and npmignore templates to fix missing template issue ([#1](https://github.com/seaofvoices/generator-luau/pull/1))

## 0.1.0

- Initial version
