import { basename, dirname, join } from 'path'
import { afterThis } from 'jest-after-this'
import { fileURLToPath } from 'url'
import helpers from 'yeoman-test'
import { Polly } from '@pollyjs/core'
import FetchAdapter from '@pollyjs/adapter-fetch'
import NodeHttpAdapter from '@pollyjs/adapter-node-http'
import FSPersister from '@pollyjs/persister-fs'

Polly.register(FetchAdapter)
Polly.register(FSPersister)
Polly.register(NodeHttpAdapter)

export const getFileContent = (context, fileName) => {
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

let previousPolly = null

export const usePolly = async (recordingName) => {
  const location = join(
    dirname(fileURLToPath(import.meta.url)),
    '__recordings__'
  )

  if (previousPolly) {
    await previousPolly.flush()
    await previousPolly.stop()
  }

  const polly = new Polly(recordingName, {
    adapters: ['node-http', 'fetch'],
    mode: 'replay',
    persister: 'fs',
    persisterOptions: { fs: { recordingsDir: location } },
    recordFailedRequests: false,
    recordIfMissing: false,
    matchRequestsBy: { headers: false, order: false },
  })

  previousPolly = polly

  afterThis(async () => {
    await polly.stop()
    if (previousPolly === polly) {
      previousPolly = null
    }
  })
}

export const setupGenerator = (generatorName) =>
  helpers.run(
    join(
      dirname(fileURLToPath(import.meta.url)),
      `../generators/${generatorName}`
    )
  )
