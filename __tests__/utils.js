import { basename, dirname, join } from 'path'
import { afterThis } from 'jest-after-this'
import { fileURLToPath } from 'url'
import helpers from 'yeoman-test'
import { Polly } from '@pollyjs/core'
import NodeHttpAdapter from '@pollyjs/adapter-node-http'
import FSPersister from '@pollyjs/persister-fs'

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

export const usePolly = (recordingName) => {
  const location = join(
    dirname(fileURLToPath(import.meta.url)),
    '__recordings__'
  )

  const polly = new Polly(recordingName, {
    adapters: [NodeHttpAdapter],
    persister: FSPersister,
    persisterOptions: {
      fs: {
        recordingsDir: location,
      },
    },
    recordIfMissing: true,
  })

  polly.replay()

  afterThis(() => {
    polly.stop()
  })
}

export const setupGenerator = (generatorName) =>
  helpers.run(
    join(
      dirname(fileURLToPath(import.meta.url)),
      `../generators/${generatorName}`
    )
  )
