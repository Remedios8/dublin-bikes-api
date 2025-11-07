import * as express from 'express';
import * as bodyParser from 'body-parser';
import { InversifyExpressServer } from 'inversify-express-utils';
const cors = require('cors');

import { inject, injectable, iocContainer } from '../../ioc';
import { IConfig, ConfigToken } from '../config/config.interface';

interface IInitResult {
    port: number;
}

interface IStartupService {
    init: () => Promise<void>;
    destroy?: () => Promise<void>;
}

@injectable()
export class AppService {

    @inject(ConfigToken)
    private config: IConfig;

    private app: express.Application;

    private initAtStartup: any[] = [];

    async init() {
        try {
            const { port } = await this.initInternal();

            console.log('Server running on port', port);
        } catch (error) {
            console.log('Can\'t start application', error);
            process.exit(1);
        }
    }

    private async initInternal(): Promise<IInitResult> {

        for (const T of this.initAtStartup) {
            const instance = <IStartupService>iocContainer.get(<any>T);

            await instance.init();
        }

        const server = new InversifyExpressServer(iocContainer.container);

        server.setConfig((app: express.Express) => {
            app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
                console.log('APP error', err);
            });
            const corsOptions = {
                origin: '*',
                methods: ['GET', 'POST'],
            };

            app.use(cors(corsOptions));
            app.use(bodyParser.json());
        });


        this.app = server.build();

        this.app.use(bodyParser.urlencoded({
            extended: true,
        }));

        this.app.listen(this.config.port);

        return {
            port: this.config.port,
        };
    }
}
