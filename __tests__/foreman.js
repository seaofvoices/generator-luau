import { expect, it, describe, jest, beforeEach } from '@jest/globals'
import { getFileContent, setupGenerator, usePolly } from './utils'

const projectName = 'new-project'
let spawnMock = jest.fn()
let answers = {}

const setupContext = async () =>
  await setupGenerator('foreman')
    .withArguments([projectName])
    .withAnswers(answers)
    .withSpawnMock(spawnMock)

beforeEach(() => {
  spawnMock = jest.fn()
  answers = {
    tools: [],
  }
})

describe('default tools', () => {
  beforeEach(() => {
    usePolly('default-tools-requests')
  })

  it('creates a foreman.toml', async () => {
    const context = await setupContext()

    expect(getFileContent(context, 'foreman.toml')).toMatchSnapshot()
  })

  it('runs the foreman install command', async () => {
    await setupContext()

    expect(spawnMock).toHaveBeenCalledWith(
      'spawnSync',
      'foreman',
      ['install'],
      expect.any(Object)
    )
  })
})

describe('all tools', () => {
  beforeEach(async () => {
    answers.tools = [
      'selene',
      'stylua',
      'luau-lsp',
      'darklua',
      'rojo',
      'tarmac',
      'run-in-roblox',
      'lune',
      'mantle',
    ]

    usePolly('all-tools-requests')
  })

  it('creates a foreman.toml', async () => {
    const context = await setupContext()

    expect(getFileContent(context, 'foreman.toml')).toMatchSnapshot()
  })

  it('runs the foreman install command', async () => {
    await setupContext()

    expect(spawnMock).toHaveBeenCalledWith(
      'spawnSync',
      'foreman',
      ['install'],
      expect.any(Object)
    )
  })

  it('runs the lune setup command', async () => {
    await setupContext()

    expect(spawnMock).toHaveBeenCalledWith(
      'spawnSync',
      'lune',
      ['setup'],
      expect.any(Object)
    )
  })
})
