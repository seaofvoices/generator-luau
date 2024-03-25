const buildRules = (options) => {
  const { devGlobal, luaEnvironment } = options

  return [
    {
      rule: 'inject_global_value',
      identifier: 'LUA_ENV',
      value: luaEnvironment,
    },
    {
      rule: 'inject_global_value',
      identifier: 'DEV',
      value: devGlobal,
    },
    {
      rule: 'inject_global_value',
      identifier: '__DEV__',
      value: devGlobal,
    },
    'compute_expression',
    'remove_unused_if_branch',
    'filter_after_early_return',
    'convert_index_to_field',
    'remove_unused_while',
    'remove_empty_do',
    'remove_method_definition',
  ]
}

export const buildDarkluaConfig = (options) => ({
  rules: [
    'remove_comments',
    'remove_spaces',
    {
      rule: 'convert_require',
      current: {
        name: 'path',
        sources: {
          '@pkg': 'node_modules/.luau-aliases',
        },
      },
      target: {
        name: 'roblox',
        rojo_sourcemap: 'sourcemap.json',
        indexing_style: 'wait_for_child',
      },
    },
    ...buildRules(options),
  ],
})

export const buildBundleDarkluaConfig = (options) => ({
  bundle: {
    require_mode: {
      name: 'path',
      sources: {
        '@pkg': 'node_modules/.luau-aliases',
      },
    },
  },
  rules: [
    'remove_types',
    'remove_comments',
    'remove_spaces',
    ...buildRules(options),
  ],
})
