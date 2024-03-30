export const extractPackageName = (packageName) => {
  const firstSlash = packageName.indexOf('/')
  if (firstSlash) {
    return {
      name: packageName.slice(firstSlash + 1),
      scope: packageName.slice(0, firstSlash),
      full: packageName,
    }
  }

  return {
    name: packageName,
    scope: null,
    full: packageName,
  }
}
