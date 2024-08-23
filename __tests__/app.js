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

beforeEach(async () => {
  spawnMock = jest.fn()
})

describe.each(['npm', 'yarn'])('using %s', (packageManager) => {
  describe('general setup', () => {
    let context = null

    beforeEach(async () => {
      context = await helpers
        .run(join(dirname(fileURLToPath(import.meta.url)), '../generators/app'))
        .withArguments([projectName])
        .withAnswers({
          packageManager,
          name: 'Author Name',
          authorName: 'Author Name',
          authorEmail: 'author@write.com',
          githubOwner: 'owner',
          codeOfConductContact: 'contact@example.com',
          tools: [],
          website: '',
        })
        .withSpawnMock(spawnMock)
    })

    it('creates the package.json file', async () => {
      expect(
        JSON.parse(getFileContent(context, 'package.json'))
      ).toMatchSnapshot({
        devDependencies: {
          '@jsdotlua/jest': expect.any(String),
          '@jsdotlua/jest-globals': expect.any(String),
          npmluau: expect.any(String),
        },
      })
    })

    it('runs install and prepare command', async () => {
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
      expect(getFileContent(context, 'README.md')).not.toBe('')
      expect(getFileContent(context, 'CODE_OF_CONDUCT.md')).not.toBe('')
      expect(getFileContent(context, '.gitignore')).not.toBe('')
      expect(getFileContent(context, '.gitattributes')).not.toBe('')
      expect(getFileContent(context, '.npmignore')).not.toBe('')
    })
  })

  describe('Roblox environment', () => {
    let context = null

    beforeEach(async () => {
      context = await helpers
        .run(join(dirname(fileURLToPath(import.meta.url)), '../generators/app'))
        .withArguments([projectName])
        .withAnswers({
          packageManager,
          name: 'Author Name',
          authorName: 'Author Name',
          authorEmail: 'author@write.com',
          githubOwner: 'owner',
          codeOfConductContact: 'contact@example.com',
          tools: [],
          website: '',
          luaEnvironment: 'roblox',
          buildRobloxModel: true,
        })
        .withSpawnMock(spawnMock)
    })

    it('creates a script to build a Roblox model', async () => {
      expect(getFileContent(context, 'build-roblox-model.sh')).toMatchSnapshot()
    })
  })
})
