import { dump } from 'js-yaml'
import { format } from 'prettier'

export const formatYaml = async (value) =>
  await format(
    dump(value).replaceAll(/\n +-|\n[^ ]/gm, (match) => '\n' + match),
    { parser: 'yaml' }
  )
