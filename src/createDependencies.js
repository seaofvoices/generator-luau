import axios from 'axios'

const VERSION_CACHE = {
  '@jsdotlua/jest': '3.10.0',
  '@jsdotlua/jest-globals': '3.10.0',
  npmluau: '0.1.2',
}

function fetchScopedPackageVersion(packageName) {
  const scope = packageName.substring(1, packageName.indexOf('/'))
  return axios
    .get(`https://registry.npmjs.com/-/v1/search`, {
      params: {
        text: `scope:${scope} ${packageName}`,
      },
    })
    .then((res) => res.data?.objects[0]?.package?.version)
}

function fetchPackageVersion(packageName) {
  return axios
    .get(`https://registry.npmjs.org/${packageName}/latest`)
    .then((res) => res.data?.version)
}

async function fetchLatestNpmPackageVersion(packageName) {
  const version = VERSION_CACHE[packageName]

  if (version !== undefined) {
    return version
  }

  const fetchedVersion = (
    packageName.startsWith('@')
      ? fetchScopedPackageVersion(packageName)
      : fetchPackageVersion(packageName)
  ).catch((err) => {
    console.warn(`fetching '${packageName}' version on npm errored: ${err}`)
    return null
  })

  if (fetchedVersion) {
    VERSION_CACHE[packageName] = fetchedVersion
  }

  return fetchedVersion
}

export async function createDependencies(...packages) {
  const versions = await Promise.all(
    packages.map(async (name) => ({
      name,
      version: await fetchLatestNpmPackageVersion(name),
    }))
  )
  return versions.reduce((dependencies, { name, version }) => {
    if (version) {
      dependencies[name] = '^' + version
    } else {
      console.warn(
        `skip dependency '${name}'. You can manually add it with ` +
          `'npm install ${name}' or 'yarn add ${name}'`
      )
    }
    return dependencies
  }, {})
}
