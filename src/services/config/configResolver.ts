import * as path from 'path';
import * as _ from 'lodash';

const environmentConfig = (config: any, stack: string) => {
  for (const property in config) {
    if (Object.hasOwnProperty.call(config, property)) {
      if (typeof config[property] === 'object') {
        environmentConfig(config[property], `${stack}_${property}`);
      } else {
        const path = `${stack}_${property}`.toUpperCase().substr(1);

        if (!process.env[`${path}`] && !_.has(config, property)) {
          throw new Error(`There is no ${path} value`);
        }
        _.merge(config, {
          [property]: process.env[`${path}`],
        });
      }
    }
  }
};

const resolveConfig = (configPath?: string): {} => {
  if (!configPath) {
    configPath = path.resolve(process.cwd(), 'config');
  }

  const config = Object.create(null);

  _.merge(config, require(`${configPath}/default.json`));
  environmentConfig(config, '');
  return config;
};

export default resolveConfig;