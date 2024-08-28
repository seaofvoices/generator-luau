import Generator from 'yeoman-generator'
import path from 'path'
import { format as formatPackageJson } from 'prettier-package-json'
import { createDependencies } from '../createDependencies'
import PackageJsonBuilder from '../PackageJsonBuilder'
import { extractPackageName } from '../extractPackageName'
import LuauPackageGenerator from '../package/index'
import ForemanGenerator from '../foreman/index'
import GeneratorLicense from '../license/index'
import { buildTestWorkflow, buildReleaseWorkflow } from './githubWorkflow'
import { buildBundleDarkluaConfig, buildDarkluaConfig } from './darkluaConfig'
import { buildRojoPlaceConfig } from './rojoConfig'
import { formatYaml } from './formatYaml'

const LICENSE_FILE_NAME = 'LICENSE.txt'

const extractFileNameInfo = (name, extensions) => {
  if (extensions.some((extension) => name.endsWith(`.${extension}`))) {
    const index = name.lastIndexOf('.')
    return {
      name: name.slice(0, index),
      extension: name.slice(index + 1),
      full: name,
    }
  }
  return {
    name,
    extension: extensions[0],
    full: `${name}.${extensions[0]}`,
  }
}

export default class LuauGenerator extends Generator {
  constructor(args, opts) {
    super(args, opts, {
      customInstallTask: () => {},
    })

    this.argument('packageName', { type: String })

    if (this.options.packageName) {
      this.destinationRoot(this.options.packageName)
    }
  }

  async prompting() {
    const gitc = {
      name: await this.git.name(),
      email: await this.git.email(),
    }

    this.promptResults = await this.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'What is the project name?',
        default: path.basename(this.destinationRoot()),
      },
      {
        type: 'input',
        name: 'authorName',
        message: 'Who is the author?',
        default: gitc.name,
      },
      {
        type: 'input',
        name: 'authorEmail',
        message: "What is the author's email?",
        default: gitc.email,
      },
      {
        type: 'input',
        name: 'githubOwner',
        message: 'Who is the GitHub owner?',
        default: (results) => results.authorName,
      },
      {
        type: 'input',
        name: 'codeOfConductContact',
        message: 'What is the contact email for the code of conduct?',
        default: (results) => results.authorEmail,
      },
      {
        type: 'confirm',
        name: 'useWorkspaces',
        message: 'Would you like setup workspaces?',
        default: false,
      },
      {
        type: 'list',
        name: 'packageManager',
        message: 'Choose package manager',
        default: 'yarn',
        choices: [
          { name: 'yarn', value: 'yarn' },
          { name: 'npm', value: 'npm' },
        ],
      },
      {
        type: 'list',
        name: 'luaEnvironment',
        message: 'Choose a Lua environment',
        default: 'roblox',
        choices: [
          'roblox',
          {
            name: 'lune',
            description:
              'A standalone Luau runtime (https://github.com/lune-org/lune)',
          },
        ],
      },
      {
        type: 'confirm',
        name: 'useJest',
        message: `Would you like to setup Jest?`,
        default: true,
        when: (results) => results.luaEnvironment === 'roblox',
      },
      {
        type: 'list',
        name: 'luaExtension',
        message: 'Choose Lua extension',
        default: 'lua',
        choices: [
          { name: 'lua', value: 'lua' },
          { name: 'luau', value: 'luau' },
        ],
      },
      {
        type: 'confirm',
        name: 'buildSingleFile',
        message: `Would you like bundle the project into a single file?`,
        default: false,
        when: (results) => !results.useWorkspaces,
      },
      {
        type: 'input',
        name: 'singleFileName',
        message: 'Specify a name for the bundled file:',
        default: (results) => {
          const nameInfo = extractPackageName(results.projectName)
          return `${nameInfo.name}.${results.luaExtension}`
        },
        when: (results) => results.buildSingleFile,
      },
      {
        type: 'confirm',
        name: 'buildRobloxModel',
        message: `Would you like to build a Roblox model file?`,
        default: false,
        when: (results) =>
          results.luaEnvironment === 'roblox' && !results.useWorkspaces,
      },
      {
        type: 'input',
        name: 'robloxModelName',
        message: 'Specify a name for the Roblox model file:',
        default: (results) => {
          const nameInfo = extractPackageName(results.projectName)
          return nameInfo.name
        },
        when: (results) => results.buildRobloxModel,
      },
      {
        type: 'confirm',
        name: 'buildDebugAssets',
        message: `Would you like to build debug assets with development globals defined as true?`,
        default: true,
        when: (results) => results.buildRobloxModel || results.buildSingleFile,
      },
    ])

    this._foremanGenerator = await this.composeWith(
      {
        Generator: ForemanGenerator,
        path: '../foreman/index.js',
      },
      {
        rojo: this.promptResults.luaEnvironment === 'roblox',
        ['run-in-roblox']: this.promptResults.useJest,
        lune: this.promptResults.luaEnvironment === 'lune',
      }
    )

    this._packageGenerator = await this.composeWith(
      {
        Generator: LuauPackageGenerator,
        path: '../package/index.js',
      },
      {
        name: this.promptResults.projectName,
        authorName: this.promptResults.authorName,
        authorEmail: this.promptResults.authorEmail,
        githubOwner: this.promptResults.githubOwner,
        location: this.promptResults.useWorkspaces ? 'packages' : null,
        luaExtension: this.promptResults.luaExtension,
        useJest: this.promptResults.useJest,
        luaEnvironment: this.promptResults.luaEnvironment,
        licenseFileName: LICENSE_FILE_NAME,
      }
    )

    this._licenseGenerator = await this.composeWith(
      {
        Generator: GeneratorLicense,
        path: '../license/index.js',
      },
      {
        defaultLicense: 'MIT',
        output: this.destinationPath(LICENSE_FILE_NAME),
      }
    )
  }

  async writing() {
    const {
      useWorkspaces,
      packageManager,
      codeOfConductContact,
      projectName,
      luaEnvironment,
      useJest,
      luaExtension,
      buildSingleFile,
      singleFileName,
      buildRobloxModel,
      robloxModelName,
      buildDebugAssets,
    } = this.promptResults
    const projectNameInfo = extractPackageName(projectName)
    const isRobloxEnv = luaEnvironment === 'roblox'
    const licenseName = this._licenseGenerator.props.license
    this._packageGenerator.licenseName = licenseName

    const robloxModelNameInfo =
      robloxModelName && extractFileNameInfo(robloxModelName, ['rbxm', 'rbxmx'])
    const singleFileNameInfo =
      singleFileName &&
      extractFileNameInfo(singleFileName, [
        luaExtension,
        luaExtension === 'lua' ? 'luau' : 'lua',
      ])

    const copyFiles = [
      '.styluaignore',
      'stylua.toml',
      'selene.toml',
      '.vscode/extensions.json',
      '.github/pull_request_template.md',
    ]
    if (packageManager === 'yarn') {
      copyFiles.push('.yarnrc.yml')
    }
    const copyFilesRename = {
      git_ignore: '.gitignore',
      git_attributes: '.gitattributes',
    }

    copyFiles.forEach((name) => {
      this.fs.copyTpl(this.templatePath(name), this.destinationPath(name))
    })
    Object.entries(copyFilesRename).forEach(
      ([templateName, destinationName]) => {
        this.fs.copyTpl(
          this.templatePath(templateName),
          this.destinationPath(destinationName)
        )
      }
    )

    const luauConfig = {
      languageMode: 'strict',
      lintErrors: true,
      lint: {
        '*': true,
      },
      aliases: {
        pkg: './node_modules/.luau-aliases',
      },
    }

    const luauAnalyzeConfig = {
      'luau-lsp.require.mode': 'relativeToFile',
      'luau-lsp.require.directoryAliases': {
        '@pkg': 'node_modules/.luau-aliases',
      },
    }

    const luneVersion = this._foremanGenerator.toolVersions.lune
    if (luneVersion) {
      const luneAliasPath = `~/.lune/.typedefs/${luneVersion}/`
      luauConfig.aliases.lune = luneAliasPath
      luauAnalyzeConfig['luau-lsp.require.directoryAliases']['@lune'] =
        luneAliasPath
    }

    this.fs.writeJSON(this.destinationPath('.luaurc'), luauConfig)
    this.fs.writeJSON(
      this.destinationPath('.luau-analyze.json'),
      luauAnalyzeConfig
    )

    this.fs.writeJSON(this.destinationPath('.vscode/settings.json'), {
      'luau-lsp.require.directoryAliases': {
        '@pkg': 'node_modules/.luau-aliases',
        // no need to write the alias for lune since it should be generated
        // by the install step from the foreman generator
      },
      'luau-lsp.sourcemap.autogenerate': false,
      'luau-lsp.require.mode': 'relativeToFile',
      'luau-lsp.completion.imports.requireStyle': 'alwaysRelative',
      'luau-lsp.types.roblox': isRobloxEnv,
    })

    const mainFolderName = useWorkspaces ? 'packages' : 'src'

    this.fs.copyTpl(
      this.templatePath(
        isRobloxEnv ? 'scripts/roblox-analyze.sh' : 'scripts/analyze.sh'
      ),
      this.destinationPath('scripts/analyze.sh'),
      { root: mainFolderName }
    )

    const buildScripts = []

    if (buildSingleFile || buildRobloxModel) {
      this.fs.copyTpl(
        this.templatePath('scripts/remove-tests.sh'),
        this.destinationPath('scripts/remove-tests.sh')
      )
    }

    const releaseArtifacts = []

    if (buildSingleFile) {
      const darkluaConfigPath = '.darklua-bundle.json'
      this.fs.writeJSON(
        this.destinationPath(darkluaConfigPath),
        buildBundleDarkluaConfig({
          devGlobal: false,
          luaEnvironment,
        })
      )

      const bundleName = singleFileNameInfo.full

      this.fs.copyTpl(
        this.templatePath('scripts/build-single-file.sh'),
        this.destinationPath('scripts/build-single-file.sh'),
        { packageManager, entryPoint: `src/init.${luaExtension}` }
      )

      buildScripts.push(
        `scripts/build-single-file.sh ${darkluaConfigPath} build/${bundleName}`
      )
      releaseArtifacts.push({
        name: bundleName,
        path: `build/${bundleName}`,
        assetType: 'text/plain',
      })

      if (buildDebugAssets) {
        const darkluaDevConfigPath = '.darklua-bundle-dev.json'
        this.fs.writeJSON(
          this.destinationPath(darkluaDevConfigPath),
          buildBundleDarkluaConfig({
            devGlobal: true,
            luaEnvironment,
          })
        )

        buildScripts.push(
          `scripts/build-single-file.sh ${darkluaDevConfigPath} build/debug/${bundleName}`
        )
        releaseArtifacts.push({
          name: `${singleFileNameInfo.name}-dev.${singleFileNameInfo.extension}`,
          path: `build/debug/${bundleName}`,
          assetType: 'text/plain',
        })
      }
    }

    if (buildRobloxModel) {
      const modelProjectJson = 'model.project.json'
      this.fs.writeJSON(this.destinationPath(modelProjectJson), {
        name: projectNameInfo.name,
        tree: {
          $path: 'src',
          node_modules: { $path: 'node_modules' },
        },
      })
      const darkluaConfigPath = '.darklua.json'
      this.fs.writeJSON(
        this.destinationPath(darkluaConfigPath),
        buildDarkluaConfig({
          devGlobal: false,
          luaEnvironment,
        })
      )

      const INSTALL_PRODUCTION = {
        yarn: ['yarn workspaces focus --production', 'yarn dlx npmluau'],
        npm: ['npm install --omit dev', 'npx npmluau'],
      }

      this.fs.copyTpl(
        this.templatePath('scripts/build-roblox-model.sh'),
        this.destinationPath('scripts/build-roblox-model.sh'),
        {
          installProduction: INSTALL_PRODUCTION[packageManager].join('\n'),
          rojoConfig: modelProjectJson,
        }
      )
      buildScripts.push(
        `scripts/build-roblox-model.sh ${darkluaConfigPath} build/${robloxModelNameInfo.full}`
      )
      releaseArtifacts.push({
        name: `${robloxModelNameInfo.full}`,
        path: `build/${robloxModelNameInfo.full}`,
        assetType: 'application/octet-stream',
      })

      if (buildDebugAssets) {
        const darkluaDevConfigPath = '.darklua-dev.json'
        this.fs.writeJSON(
          this.destinationPath(darkluaDevConfigPath),
          buildDarkluaConfig({
            devGlobal: true,
            luaEnvironment,
          })
        )

        buildScripts.push(
          `scripts/build-roblox-model.sh ${darkluaDevConfigPath} build/debug/${robloxModelNameInfo.full}`
        )
        releaseArtifacts.push({
          name: `${robloxModelNameInfo.name}-dev.${robloxModelNameInfo.extension}`,
          path: `build/debug/${robloxModelNameInfo.full}`,
          assetType: 'application/octet-stream',
        })
      }
    }

    const hasBuildScripts = buildScripts.length > 0

    if (hasBuildScripts) {
      this.fs.copyTpl(
        this.templatePath('scripts/build.sh'),
        this.destinationPath('scripts/build.sh'),
        { scripts: buildScripts.join('\n') }
      )
    }

    this.fs.write(
      this.destinationPath('.github/workflows/test.yml'),
      await formatYaml(buildTestWorkflow({ packageManager, hasBuildScripts }))
    )

    this.fs.write(
      this.destinationPath('.github/workflows/release.yml'),
      await formatYaml(
        buildReleaseWorkflow({
          packageManager,
          useWorkspaces,
          artifacts: releaseArtifacts,
        })
      )
    )

    this.fs.copyTpl(
      this.templatePath('selene_defs.yml'),
      this.destinationPath('selene_defs.yml'),
      { seleneBase: isRobloxEnv ? 'roblox' : 'lua51' }
    )

    const packageBuilder = new PackageJsonBuilder(
      useWorkspaces ? 'workspace' : projectName
    )
    if (useWorkspaces) {
      packageBuilder.merge({
        workspaces: [mainFolderName + '/*'],
        private: true,
      })
    } else {
      packageBuilder.merge({ license: licenseName })
    }

    this.fs.copyTpl(
      this.templatePath('CODE_OF_CONDUCT.md'),
      this.destinationPath('CODE_OF_CONDUCT.md'),
      { contact: codeOfConductContact }
    )

    packageBuilder.addDevDependencies(await createDependencies('npmluau'))
    packageBuilder.addScripts({
      prepare: 'npmluau',
      lint: `sh ./scripts/analyze.sh && selene ${mainFolderName}`,
      'lint:luau': 'sh ./scripts/analyze.sh',
      'lint:selene': `selene ${mainFolderName}`,
      format: 'stylua .',
      'style-check': 'stylua . --check',

      'verify-pack':
        packageManager === 'yarn'
          ? 'yarn workspaces foreach -A --no-private pack --dry-run'
          : 'npm pack --dry-run',
      clean: 'rm -rf node_modules build' + (isRobloxEnv ? ' temp' : ''),
    })

    if (hasBuildScripts) {
      packageBuilder.addScripts({
        build: 'sh ./scripts/build.sh',
      })
    }

    if (useJest) {
      const testRojoProjectFile = 'test-place.project.json'

      const replicatedStorageDefinition = {
        node_modules: { $path: './node_modules' },
      }

      const jestRoots = []
      const jestConfigPath = `jest.config.${luaExtension}`

      if (useWorkspaces) {
        jestRoots.push(
          ...this._packageGenerator.packages.map((name) =>
            [
              'ReplicatedStorage:FindFirstChild("node_modules")',
              ...name
                .split('/')
                .map((instanceName) => `:FindFirstChild("${instanceName}")`),
            ].join('')
          )
        )
      } else {
        jestRoots.push('ReplicatedStorage:FindFirstChild("TestTarget")')
        replicatedStorageDefinition.TestTarget = {
          $path: './src',
          'jest.config': { $path: `./${jestConfigPath}` },
        }
      }

      this.fs.writeJSON(
        this.destinationPath(testRojoProjectFile),
        buildRojoPlaceConfig({
          name: 'test-place',
          services: {
            ReplicatedStorage: replicatedStorageDefinition,
            ServerScriptService: {
              RunTests: {
                $path: `./scripts/roblox-test.server.${luaExtension}`,
              },
            },
          },
        })
      )

      const darkluaConfig = '.darklua-tests.json'
      this.fs.writeJSON(
        this.destinationPath(darkluaConfig),
        buildDarkluaConfig({
          devGlobal: false,
          luaEnvironment,
        })
      )

      const runRobloxTestPath = `scripts/roblox-test.server.${luaExtension}`
      const folders = useWorkspaces
        ? ['node_modules', runRobloxTestPath]
        : [jestConfigPath, runRobloxTestPath, 'node_modules', 'src']

      this.fs.copyTpl(
        this.templatePath('scripts/roblox-test.sh'),
        this.destinationPath('scripts/roblox-test.sh'),
        {
          packageManager,
          testRojoProjectFile,
          darkluaConfig,
          folders,
          luaExtension,
        }
      )
      this.fs.copyTpl(
        this.templatePath('scripts/roblox-test.server.lua'),
        this.destinationPath(runRobloxTestPath),
        { jestRoots: jestRoots.join(', ') }
      )

      if (useWorkspaces) {
        this._packageGenerator.packages.forEach((name) => {
          this.fs.copyTpl(
            this.templatePath('jest.config.lua'),
            this.destinationPath(`${mainFolderName}/${name}/${jestConfigPath}`)
          )
        })
      } else {
        this.fs.copyTpl(
          this.templatePath('jest.config.lua'),
          this.destinationPath(jestConfigPath)
        )
      }

      packageBuilder.addScripts({
        'test:roblox': 'sh ./scripts/roblox-test.sh',
      })
    }

    if (packageManager === 'yarn') {
      if (useWorkspaces) {
        packageBuilder.addScripts({
          'verify-pack':
            'yarn workspaces foreach -A --no-private pack --dry-run',
        })
      } else {
        packageBuilder.addScripts({
          'verify-pack': 'yarn pack --dry-run',
        })
      }
    } else {
      packageBuilder.addScripts({
        'verify-pack': 'npm pack --dry-run',
      })
    }

    this.fs.write(
      this.destinationPath('package.json'),
      formatPackageJson(packageBuilder.build())
    )

    if (useWorkspaces) {
      // add license to nested package jsons
    }
  }

  install() {
    const { packageManager } = this.promptResults
    const cwd = this.destinationRoot()
    const execOptions = { cwd }

    if (packageManager === 'yarn') {
      this.spawnSync('yarn', ['set', 'version', 'stable'], execOptions)
    }
    this.spawnSync(packageManager, ['install'], execOptions)
    this.spawnSync(packageManager, ['run', 'prepare'], execOptions)
    this.spawnSync('stylua', ['.'], execOptions)
  }
}
