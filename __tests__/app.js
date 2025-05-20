import { expect, it, describe, jest, beforeEach } from '@jest/globals'
import { getFileContent, setupGenerator, usePolly } from './utils'

const projectName = 'new-project'
let spawnMock = jest.fn()
let answers = {}

const setupContext = async () =>
  await setupGenerator('app')
    .withArguments([projectName])
    .withAnswers(answers)
    .withSpawnMock(spawnMock)

beforeEach(async () => {
  spawnMock = jest.fn()
  answers = {
    name: 'Author Name',
    authorName: 'Author Name',
    authorEmail: 'author@write.com',
    githubOwner: 'owner',
    codeOfConductContact: 'contact@example.com',
    tools: [],
    website: '',
  }

  await usePolly('all-tools-requests')
})

describe.each(['npm', 'yarn'])('using %s', (packageManager) => {
  beforeEach(() => {
    answers.packageManager = packageManager
  })

  it('creates the package.json file', async () => {
    const context = await setupContext()
    expect(JSON.parse(getFileContent(context, 'package.json'))).toMatchSnapshot(
      {
        devDependencies: {
          '@jsdotlua/jest': expect.any(String),
          '@jsdotlua/jest-globals': expect.any(String),
          npmluau: expect.any(String),
        },
      }
    )
  })

  it('runs install and prepare command', async () => {
    await setupContext()
    if (packageManager === 'yarn') {
      expect(spawnMock).toHaveBeenCalledWith(
        'spawnSync',
        packageManager,
        ['set', 'version', 'stable'],
        expect.any(Object)
      )
    }
    expect(spawnMock).toHaveBeenCalledWith(
      'spawnSync',
      packageManager,
      ['install'],
      expect.any(Object)
    )
    expect(spawnMock).toHaveBeenCalledWith(
      'spawnSync',
      packageManager,
      ['run', 'prepare'],
      expect.any(Object)
    )
  })

  it('creates generic repo files', async () => {
    const context = await setupContext()
    expect(getFileContent(context, 'README.md')).not.toBe('')
    expect(getFileContent(context, 'CODE_OF_CONDUCT.md')).not.toBe('')
    expect(getFileContent(context, '.gitignore')).not.toBe('')
    expect(getFileContent(context, '.gitattributes')).not.toBe('')
    expect(getFileContent(context, '.npmignore')).not.toBe('')
  })

  describe('Roblox environment', () => {
    beforeEach(async () => {
      answers.luaEnvironment = 'roblox'
      answers.buildRobloxModel = true
    })

    it.each(['build-roblox-model.sh', '.luaurc'])(
      'creates a %s file',
      async (fileName) => {
        const context = await setupContext()
        expect(getFileContent(context, fileName)).toMatchSnapshot()
      }
    )

    describe.each(['lua', 'luau'])('using %s', (luaExtension) => {
      beforeEach(async () => {
        answers.luaExtension = luaExtension
      })

      it('creates an entry point to run the test in Roblox studio', async () => {
        const context = await setupContext()
        expect(
          getFileContent(context, `roblox-test.server.${luaExtension}`)
        ).not.toBe('')
      })
    })
  })

  describe('Lune environment', () => {
    beforeEach(async () => {
      answers.luaEnvironment = 'lune'
    })

    it.each(['.luaurc'])(
      'creates a %s file',
      async (fileName) => {
        const context = await setupContext()
        expect(getFileContent(context, fileName)).toMatchSnapshot()
      }
    )
  })
})
