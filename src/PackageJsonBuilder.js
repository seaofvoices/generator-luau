export default class PackageJsonBuilder {
  constructor(name) {
    this._base = {
      name,
      keywords: ['luau'],
    }
    this._dependencies = {}
    this._devDependencies = {}
    this._scripts = {}
  }

  static from(packageJson) {
    const { name, ...definitions } = packageJson
    return new PackageJsonBuilder(name).merge(definitions)
  }

  merge({ scripts, dependencies, devDependencies, ...definitions }) {
    Object.assign(this._base, definitions)
    if (scripts) {
      this.addScripts(scripts)
    }
    if (devDependencies) {
      this.addDevDependencies(devDependencies)
    }
    if (dependencies) {
      this.addDependencies(dependencies)
    }
    return this
  }

  addScripts(scripts) {
    Object.assign(this._scripts, scripts)
    return this
  }

  addDevDependencies(dependencies) {
    Object.assign(this._devDependencies, dependencies)
    return this
  }

  addDependencies(dependencies) {
    Object.assign(this._dependencies, dependencies)
    return this
  }

  build() {
    return Object.assign(
      {},
      {
        scripts: this._scripts,
        dependencies: this._dependencies,
        devDependencies: this._devDependencies,
      },
      this._base
    )
  }
}
