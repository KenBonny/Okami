import defaultConfig from '../config/default.json';
import devConfig from '../config/development.json';
import prodConfig from '../config/production.json';

const env = process.env.NODE_ENV || 'development';

const configs = {
    default: defaultConfig as Config,
    development: devConfig as Config,
    production: prodConfig as Config
};

export interface WarningConfig {
    readonly monthsBeforeFirst: number;
    readonly monthsBeforeSecond: number;
}

export interface Config {
    readonly defaultExpiration: number;
    readonly maxExpiration: number;
    readonly monthsToKeepDeletedItems: number;
    readonly warnings: WarningConfig;
}

export const config : Config = {
    ...configs.default,
    // @ts-ignore
    ...configs[env]
};
