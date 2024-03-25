import { expect, it } from '@jest/globals'

import { formatYaml } from '../formatYaml'
import { buildTestWorkflow, buildReleaseWorkflow } from '../githubWorkflow'

it('format the github test workflow file', async () => {
  expect(
    await formatYaml(buildTestWorkflow({ packageManager: 'yarn' }))
  ).toMatchSnapshot()
})

it('format the github release workflow file', async () => {
  expect(
    await formatYaml(
      buildReleaseWorkflow({
        packageManager: 'yarn',
        useWorkspaces: false,
        artifacts: [
          { name: 'out.lua', path: 'build/out.lua', assetType: 'text/plain' },
        ],
      })
    )
  ).toMatchSnapshot()
})
