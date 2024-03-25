import Generator from 'yeoman-generator'

const licenses = [
  { name: 'Apache 2.0', value: 'Apache-2.0' },
  { name: 'MIT', value: 'MIT' },
  { name: 'Mozilla Public License 2.0', value: 'MPL-2.0' },
  { name: 'BSD 2-Clause (FreeBSD) License', value: 'BSD-2-Clause-FreeBSD' },
  { name: 'BSD 3-Clause (NewBSD) License', value: 'BSD-3-Clause' },
  { name: 'Internet Systems Consortium (ISC) License', value: 'ISC' },
  { name: 'GNU AGPL 3.0', value: 'AGPL-3.0' },
  { name: 'GNU GPL 3.0', value: 'GPL-3.0' },
  { name: 'GNU LGPL 3.0', value: 'LGPL-3.0' },
  { name: 'Unlicense', value: 'Unlicense' },
  { name: 'No License (Copyrighted)', value: 'UNLICENSED' },
]

export default class GeneratorLicense extends Generator {
  constructor(args, opts) {
    super(args, opts)

    this.option('name', {
      type: String,
      desc: 'Name of the license owner',
      required: false,
    })

    this.option('email', {
      type: String,
      desc: 'Email of the license owner',
      required: false,
    })

    this.option('website', {
      type: String,
      desc: 'Website of the license owner',
      required: false,
    })

    this.option('year', {
      type: String,
      desc: 'Year(s) to include on the license',
      required: false,
      defaults: new Date().getFullYear(),
    })

    this.option('licensePrompt', {
      type: String,
      desc: 'License prompt text',
      defaults: 'Which license do you want to use?',
      hide: true,
      required: false,
    })

    this.option('defaultLicense', {
      type: String,
      desc: 'Default license',
      required: false,
    })

    this.option('license', {
      type: String,
      desc: 'Select a license, so no license prompt will happen, in case you want to handle it outside of this generator',
      required: false,
    })

    this.option('output', {
      type: String,
      desc: 'Set the output file for the generated license',
      required: false,
      defaults: 'LICENSE',
    })

    this.option('publish', {
      type: Boolean,
      desc: 'Publish the package',
      required: false,
    })
  }

  async prompting() {
    this.gitc = {
      user: {
        name: await this.git.name(),
        email: await this.git.email(),
      },
    }
    const prompts = [
      {
        name: 'name',
        message: 'What name should the license use?',
        default: this.options.name || this.gitc.user.name,
        when: this.options.name === undefined,
      },
      {
        name: 'email',
        message: 'What email should the license use? (optional)',
        default: null,
        when: this.options.email === undefined,
      },
      {
        name: 'website',
        message: 'What website should the license use? (optional)',
        default: this.options.website ?? '',
        when: this.options.website === undefined,
      },
      {
        type: 'list',
        name: 'license',
        message: this.options.licensePrompt,
        default: this.options.defaultLicense,
        when:
          !this.options.license ||
          licenses.find((x) => x.value === this.options.license) === undefined,
        choices: licenses,
      },
    ]

    const props = await this.prompt(prompts)
    this.props = {
      name: this.options.name,
      email: this.options.email,
      website: this.options.website,
      license: this.options.license,
      ...props,
    }
  }

  writing() {
    // License file
    const filename = this.props.license + '.txt'
    let author = this.props.name.trim()

    if (this.props.email) {
      author += ' <' + this.props.email.trim() + '>'
    }

    if (this.props.website) {
      author += ' (' + this.props.website.trim() + ')'
    }

    this.fs.copyTpl(
      this.templatePath(filename),
      this.destinationPath(this.options.output),
      {
        year: this.options.year,
        author: author,
      }
    )
  }
}
