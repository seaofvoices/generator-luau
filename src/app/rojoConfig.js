export const buildRojoPlaceConfig = ({
  name,
  enableHttpService = true,
  autoLoadCharacters = false,
  services = {},
}) => {
  const config = {
    name,
    tree: {
      $className: 'DataModel',
      ...services,
    },
  }

  if (enableHttpService) {
    config.tree.HttpService = {
      $properties: {
        HttpEnabled: true,
      },
    }
  }

  if (autoLoadCharacters !== null) {
    config.tree.Players = {
      $properties: {
        CharacterAutoLoads: autoLoadCharacters,
      },
    }
  }

  return config
}
