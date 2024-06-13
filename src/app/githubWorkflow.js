const WORKFLOW_DISPATCH = {
  inputs: {
    release_tag: {
      description: 'The version to release starting with `v`',
      required: true,
      type: 'string',
    },
    release_ref: {
      description: 'The branch, tag or SHA to checkout (default to latest)',
      default: '',
      type: 'string',
    },
  },
}

const buildProjectSetup = ({ packageManager }) => {
  const steps = []
  const isYarn = packageManager === 'yarn'
  if (isYarn) {
    steps.push({
      name: 'Enable corepack',
      run: 'corepack enable',
    })
  }
  steps.push({
    uses: 'actions/setup-node@v3',
    with: {
      'node-version': 'latest',
      'registry-url': 'https://registry.npmjs.org',
      cache: packageManager,
      'cache-dependency-path':
        packageManager === 'yarn' ? 'yarn.lock' : 'package-lock.json',
    },
  })
  if (isYarn) {
    steps.push({
      name: 'Install packages',
      run: 'yarn install --immutable',
    })
    steps.push({
      name: 'Run npmluau',
      run: 'yarn run prepare',
    })
  } else {
    steps.push({
      name: 'Install packages',
      run: 'npm ci',
    })
  }
  return steps
}

const buildPublishSteps = (options) => {
  const { packageManager, useWorkspaces } = options
  const steps = [
    {
      uses: 'actions/checkout@v4',
    },
    ...buildProjectSetup(options),
  ]

  if (packageManager === 'yarn') {
    steps.push({
      name: 'Authenticate yarn',
      run: 'yarn config set npmAlwaysAuth true\nyarn config set npmAuthToken $NPM_AUTH_TOKEN',
      env: {
        NPM_AUTH_TOKEN: '${{ secrets.NPM_TOKEN }}',
      },
    })
    if (useWorkspaces) {
      steps.push({
        name: 'Publish to npm',
        run: 'yarn workspaces foreach --all --no-private npm publish --access public --tolerate-republish',
      })
    } else {
      steps.push({
        name: 'Publish to npm',
        run: 'yarn npm publish --access public',
      })
    }
  } else {
    if (useWorkspaces) {
      console.warn('publishing workspace packages is not supported')
    } else {
      steps.push({
        name: 'Publish to npm',
        run: 'npm publish',
        env: {
          NODE_AUTH_TOKEN: '${{ secrets.NPM_TOKEN }}',
        },
      })
    }
  }
  return steps
}

export const buildTestWorkflow = (options) => {
  const { packageManager, hasBuildScripts } = options

  const buildSteps = hasBuildScripts
    ? [{ name: 'Build assets', run: `${packageManager} run build` }]
    : []

  return {
    name: 'Tests',
    on: {
      push: { branches: ['main'] },
      pull_request: { branches: ['main'] },
    },
    jobs: {
      test: {
        name: 'Run tests',
        'runs-on': 'ubuntu-latest',
        steps: [
          {
            uses: 'actions/checkout@v4',
          },
          {
            uses: 'Roblox/setup-foreman@v1',
            with: {
              token: '${{ secrets.GITHUB_TOKEN }}',
            },
          },
          ...buildProjectSetup(options),
          {
            name: 'Run linter',
            run: `${packageManager} run lint`,
          },
          {
            name: 'Verify code style',
            run: `${packageManager} run style-check`,
          },
          ...buildSteps,
        ],
      },
    },
  }
}

// options: {
//   packageManager: "yarn" | "npm",
//   useWorkspaces: bool,
//   artifacts: { name: string, path: string, assetType: string }[]
// }
export const buildReleaseWorkflow = (options) => {
  const { packageManager, artifacts } = options

  const jobs = {
    'publish-package': {
      name: 'Publish package',
      'runs-on': 'ubuntu-latest',
      steps: buildPublishSteps(options),
    },
    'create-release': {
      needs: 'publish-package',
      name: 'Create release',
      'runs-on': 'ubuntu-latest',
      outputs: {
        upload_url: '${{ steps.create_release.outputs.upload_url }}',
      },
      steps: [
        { uses: 'actions/checkout@v4' },
        {
          name: 'Create tag',
          run: 'git fetch --tags --no-recurse-submodules\nif [ ! $(git tag -l ${{ inputs.release_tag }}) ]; then\n  git tag ${{ inputs.release_tag }}\n  git push origin ${{ inputs.release_tag }}\nfi\n',
        },
        {
          name: 'Create release',
          id: 'create_release',
          uses: 'softprops/action-gh-release@v1',
          env: {
            GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}',
          },
          with: {
            tag_name: '${{ inputs.release_tag }}',
            name: '${{ inputs.release_tag }}',
            draft: false,
          },
        },
      ],
    },
  }

  if (artifacts.length > 0) {
    jobs['build-assets'] = {
      needs: 'create-release',
      name: 'Add assets',
      'runs-on': 'ubuntu-latest',
      strategy: {
        'fail-fast': false,
        matrix: {
          include: artifacts.map((info) => ({
            'artifact-name': info.name,
            path: info.path,
            'asset-type': info.assetType,
          })),
        },
      },
      steps: [
        { uses: 'actions/checkout@v4' },
        {
          uses: 'Roblox/setup-foreman@v1',
          with: {
            token: '${{ secrets.GITHUB_TOKEN }}',
          },
        },
        ...buildProjectSetup(options),
        {
          name: 'Build assets',
          run: `${packageManager} run build`,
        },
        {
          name: 'Upload asset',
          uses: 'actions/upload-artifact@v3',
          with: {
            name: '${{ matrix.artifact-name }}',
            path: '${{ matrix.path }}',
          },
        },
        {
          name: 'Add asset to Release',
          uses: 'actions/upload-release-asset@v1',
          env: {
            GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}',
          },
          with: {
            upload_url: '${{ needs.create-release.outputs.upload_url }}',
            asset_path: '${{ matrix.path }}',
            asset_name: '${{ matrix.artifact-name }}',
            asset_content_type: '${{ matrix.asset-type }}',
          },
        },
      ],
    }
  }

  return {
    name: 'Release',
    on: {
      workflow_dispatch: WORKFLOW_DISPATCH,
    },
    permissions: {
      contents: 'write',
    },
    jobs,
  }
}
