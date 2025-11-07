import 'reflect-metadata';
import { Container, interfaces } from 'inversify';

import { ConfigToken } from '../services/config/config.interface';
import resolveConfig from '../services/config/configResolver';

class IocContainer {
    public container: Container;

    constructor() {
        this.container = new Container();
    }

    get<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T {
        return this.container.get<T>(serviceIdentifier);
    }

    registerConfig(configFolder?: string) {
        this.container.bind(ConfigToken).toConstantValue(resolveConfig(configFolder));
    }

    registerSingleton(service: any | any[], identifier?: any) {
        if (Array.isArray(service)) {
            for (const s of service) {
                this.container.bind(s).to(s).inSingletonScope();
            }
        } else {
            this.container.bind(identifier || service).to(service).inSingletonScope();
        }
    }
}

const iocContainer = new IocContainer();

export { Container, inject, injectable } from 'inversify';
export { iocContainer };
