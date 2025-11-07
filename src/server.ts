import { iocContainer } from './ioc';
import './ioc/loader';
import { AppService } from './services/app/app.service';

(<AppService>iocContainer.get(AppService)).init().then();
