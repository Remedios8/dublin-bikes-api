import { iocContainer } from './';
import '../controllers/home.controller';

import { AppService } from '../services/app/app.service';
import { DataService } from '../services/data/data.service';

iocContainer.registerConfig();
iocContainer.registerSingleton([
    AppService,
    DataService
]);
