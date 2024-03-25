import { join, dirname, basename } from 'path'
import { fileURLToPath } from 'url'
import helpers from 'yeoman-test'
import { expect, it, jest, beforeEach } from '@jest/globals'

const getFileContent = (context, fileName) => {
  const snapshot = context.getSnapshot(
    (file) => file.relativePath && basename(file.relativePath) === fileName
  )
  return Object.values(snapshot)[0].contents
}

const projectName = 'new-project'
let spawnMock = jest.fn()
let context = null

beforeEach(async () => {
  spawnMock = jest.fn()
  context = await helpers
    .run(join(dirname(fileURLToPath(import.meta.url)), '../generators/app'))
    .withArguments([projectName])
    .withAnswers({
      name: "Author Name",
      authorName: "Author Name",
      authorEmail: "author@write.com",
      githubOwner: 'owner',
      codeOfConductContact: 'contact@example.com',
      tools: [],
      website: '',
    })
    .withSpawnMock(spawnMock)
})

it('creates the package.json file', async () => {
  expect(JSON.parse(getFileContent(context, 'package.json'))).toMatchSnapshot({
    devDependencies: {
      '@jsdotlua/jest': expect.any(String),
      '@jsdotlua/jest-globals': expect.any(String),
      npmluau: expect.any(String),
    },
  })
})

it('runs install and prepare command', async () => {
  expect(spawnMock).toHaveBeenCalledWith(
    'spawnSync',
    'yarn',
    ['set', 'version', 'stable'],
    expect.any(Object)
  )
  expect(spawnMock).toHaveBeenCalledWith(
    'spawnSync',
    'yarn',
    ['install'],
    expect.any(Object)
  )
  expect(spawnMock).toHaveBeenCalledWith(
    'spawnSync',
    'yarn',
    ['prepare'],
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
