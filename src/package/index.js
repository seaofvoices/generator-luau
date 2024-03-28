import Generator from 'yeoman-generator'
import path from 'path'
import { format as formatPackageJson } from 'prettier-package-json'
import PackageJsonBuilder from '../PackageJsonBuilder.js'
import { createDependencies } from '../createDependencies.js'

export default class LuauPackageGenerator extends Generator {
  constructor(args, opts) {
    super(args, opts)

    this._name = opts.name
    this._authorName = opts.authorName
    this._authorEmail = opts.authorEmail
    this._githubOwner = opts.githubOwner
    this._luaExtension = opts.luaExtension
    this._useJest = opts.useJest
    this._luaEnvironment = opts.luaEnvironment
    this._licenseFileName = opts.licenseFileName

    this._location = opts.location
    this._isWorkspace = opts.location != null
    this._canSetupMultipleProjects = this._isWorkspace
  }

  async prompting() {
    this._projects = [
      await this._setupProject(
        this._name,
        path.basename(this.destinationRoot())
      ),
    ]

    let askAgain = this._canSetupMultipleProjects

    while (askAgain) {
      const { setupNewProject } = await this.prompt([
        {
          type: 'confirm',
          name: 'setupNewProject',
          message: 'Would you like to setup another project?',
          default: false,
        },
      ])
      if (setupNewProject) {
        this._projects.push(await this._setupProject())
      } else {
        askAgain = false
      }
    }

    this.packages = this._projects.map(({ projectName }) => projectName)
  }

  async _setupProject(name, defaultName) {
    const { projectName } = name
      ? { projectName: name }
      : await this.prompt([
          {
            type: 'input',
            name: 'projectName',
            message: 'What is the project name?',
            default: defaultName,
          },
        ])

    const { useReact } = await this.prompt([
      {
        type: 'confirm',
        name: 'useReact',
        message: 'Would you like to use React Lua?',
        when: this._luaEnvironment === 'roblox',
        default: false,
      },
    ])

    return {
      projectName,
      useReact,
    }
  }

  async writing() {
    const luaExtension = this._luaExtension
    const luaEnvironment = this._luaEnvironment
    const licenseName = this.licenseName ?? 'UNLICENSED'

    await Promise.all(
      this._projects.map(async ({ projectName, useReact }) => {
        const getLocation = this._location
          ? (...subpath) =>
              this.destinationPath(this._location, projectName, ...subpath)
          : (...subpath) => this.destinationPath(...subpath)

        const packageJsonLocation = getLocation('package.json')

        const packageBuilder = this.fs.exists(packageJsonLocation)
          ? PackageJsonBuilder.from(this.fs.readJSON(packageJsonLocation))
          : new PackageJsonBuilder(projectName)

        const entryPoint = `src/init.${luaExtension}`
        const repositoryBaseUrl = this._isWorkspace
          ? `https://github.com/${this._githubOwner}/${this._name}`
          : `https://github.com/${this._githubOwner}/${projectName}`

        const gitRepoUrl = `git+${repositoryBaseUrl}.git`

        packageBuilder.merge({
          version: '0.1.0',
          main: entryPoint,
          description: '',
          author: `${this._authorName} <${this._authorEmail}>`,
          repository: this._isWorkspace
            ? {
                type: 'git',
                url: gitRepoUrl,
                directory: `${this._location}/${projectName}`,
              }
            : { type: 'git', url: gitRepoUrl },
          homepage: `${repositoryBaseUrl}#readme`,
        })

        this.fs.write(getLocation(entryPoint), 'return {}\n')

        this.fs.copyTpl(
          this.templatePath('README.md'),
          getLocation('README.md'),
          {
            projectName,
            licenseName,
            licensePath: `${this._location ? '../../' : ''}LICENSE.txt`,
            githubOwner: this._githubOwner,
          }
        )

        const copyFiles = {
          'CHANGELOG.md': 'CHANGELOG.md',
          npm_ignore: '.npmignore',
        }

        Object.entries(copyFiles).forEach(([templateName, destinationName]) => {
          this.fs.copyTpl(
            this.templatePath(templateName),
            this.destinationPath(destinationName)
          )
        })

        if (useReact) {
          if (luaEnvironment === 'roblox') {
            packageBuilder.addDependencies(
              await createDependencies(
                '@jsdotlua/react',
                '@jsdotlua/react-roblox'
              )
            )
          } else {
            packageBuilder.addDependencies(
              await createDependencies('@jsdotlua/react')
            )
          }
        }

        if (this._useJest) {
          packageBuilder.addDevDependencies(
            await createDependencies('@jsdotlua/jest', '@jsdotlua/jest-globals')
          )

          const testFilePath = `init.test.${luaExtension}`
          this.fs.copyTpl(
            this.templatePath('init.test.lua'),
            getLocation(`src/__tests__/${testFilePath}`)
          )
        }

        this.fs.write(
          packageJsonLocation,
          formatPackageJson(packageBuilder.build())
        )
      })
    )
  }
}
