import { join, dirname, basename } from 'path'
import { fileURLToPath } from 'url'
import helpers from 'yeoman-test'
import { expect, it, describe, jest, beforeEach } from '@jest/globals'

const getFileContent = (context, fileName) => {
  const snapshot = context.getSnapshot(
    (file) => file.relativePath && basename(file.relativePath) === fileName
  )

  const snapshotValues = Object.values(snapshot)
  if (snapshotValues.length === 0) {
    throw Error(`Unable to find file ${fileName}`)
  }
  if (snapshotValues.length > 1) {
    throw Error(`Found multiple file for ${fileName}`)
  }

  return snapshotValues[0].contents
}

const projectName = 'new-project'
let spawnMock = jest.fn()
let answers = {}

const setupContext = async () =>
  await helpers
    .run(join(dirname(fileURLToPath(import.meta.url)), '../generators/app'))
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
    const context = await setupContext()
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

    it('creates a script to build a Roblox model', async () => {
      const context = await setupContext()
      expect(getFileContent(context, 'build-roblox-model.sh')).toMatchSnapshot()
    })

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
})
