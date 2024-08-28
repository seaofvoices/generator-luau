import Generator from 'yeoman-generator'
import { request } from '@octokit/request'

const TOOLS = {
  selene: { owner: 'Kampfkarren', repo: 'selene' },
  stylua: { owner: 'JohnnyMorganz', repo: 'StyLua' },
  'luau-lsp': { owner: 'JohnnyMorganz', repo: 'luau-lsp' },
  darklua: { owner: 'seaofvoices', repo: 'darklua' },
  rojo: { owner: 'rojo-rbx', repo: 'rojo' },
  tarmac: { owner: 'rojo-rbx', repo: 'tarmac' },
  'run-in-roblox': { owner: 'rojo-rbx', repo: 'run-in-roblox' },
  lune: { owner: 'lune-org', repo: 'lune' },
  mantle: { owner: 'blake-mealey', repo: 'mantle' },
}

const TOOL_NAMES = Object.keys(TOOLS)

class ForemanGenerator extends Generator {
  constructor(args, opts) {
    super(args, opts)

    this.opts = opts
  }

  initializing() {
    this._foremanTools = new Set(['selene', 'stylua', 'luau-lsp', 'darklua'])

    TOOL_NAMES.forEach((tool) => {
      if (this.opts[tool] === true) {
        this._foremanTools.add(tool)
      }
    })
  }

  async prompting() {
    this.promptResults = await this.prompt([
      {
        type: 'checkbox',
        name: 'tools',
        choices: TOOL_NAMES.filter((tool) => !this._foremanTools.has(tool)),
      },
    ])

    this.promptResults.tools.forEach((tool) => {
      this._foremanTools.add(tool)
    })
  }

  async fetchForemanToolVersions() {
    const requestWithAuth = request.defaults({})

    this._foremanToolsVersions = (
      await Promise.all(
        Array.from(this._foremanTools).map(async (name) => {
          if (!(name in TOOLS)) {
            this.log(`unable to find owner and repo for tool '${name}'`)
            return null
          }

          const { owner, repo } = TOOLS[name]
          const version = await requestWithAuth(
            'GET /repos/{owner}/{repo}/releases',
            {
              owner,
              repo,
              headers: {
                'X-GitHub-Api-Version': '2022-11-28',
              },
            }
          )
            .then((releases) => {
              const tagName = releases.data[0].tag_name
              if (tagName.startsWith('v')) {
                return tagName.slice(1)
              }

              return tagName
            })
            .catch((err) => {
              this.log(
                `fetching ${name} version at ${owner}/${repo} errored: ${err}\n` +
                  `  visit https://github.com/${owner}/${repo}/releases to find the latest version`
              )
              return null
            })

          if (version === null) {
            return {
              name,
              owner,
              repo,
              version: '*',
            }
          }

          return {
            name,
            owner,
            repo,
            version,
          }
        })
      )
    ).filter((tool) => tool !== null)

    this._foremanToolsVersions.sort((a, b) =>
      a.name < b.name ? -1 : a.name > b.name ? 1 : 0
    )

    this.toolVersions = Object.fromEntries(
      this._foremanToolsVersions
        .filter(({ version }) => version !== '*')
        .map(({ name, version }) => [name, version])
    )
  }

  writing() {
    this.fs.write(
      this.destinationPath('foreman.toml'),
      ['[tools]']
        .concat(
          this._foremanToolsVersions.map(
            ({ name, owner, repo, version }) =>
              `${name} = { github = "${owner}/${repo}", version = "=${version}"}`
          )
        )
        .join('\n') + '\n'
    )
  }

  install() {
    const cwd = this.destinationRoot()
    const execOptions = { cwd }

    this.spawnSync('foreman', ['install'], execOptions)

    if (this._foremanTools.has('lune')) {
      this.spawnSync('lune', ['setup'], execOptions)
    }
  }
}

export default ForemanGenerator
