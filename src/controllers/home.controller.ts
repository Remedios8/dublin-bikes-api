import { controller, httpGet, httpPost, queryParam, requestBody, response } from 'inversify-express-utils';
import { inject } from 'inversify';
import * as express from 'express';

import { DataService } from '../services/data/data.service';

@controller('/')
export class HomeController {
    @inject(DataService)
    private dataService: DataService;

    @httpGet('/')
    public get(req: express.Request, res: express.Response): any {
        console.log('GET / request received');
        return res.status(200).send('Hello from Full Stack Engineering Exercise!');
    }

    @httpGet('/schema')
    public async getSchema(@response() res: express.Response, @queryParam('url') url?: string): Promise<any> {
        console.log('GET /schema request received');
        try {
            const records = await this.dataService.fetchAndParse(url);
            if (!Array.isArray(records)) return res.status(400).json({ error: 'Dataset did not produce an array of records' });
            const schema = this.dataService.inferSchema(records);
            return res.status(200).json(schema);
        } catch (err: any) {
            return res.status(500).json({ error: err?.message || String(err) });
        }
    }

    @httpPost('/data')
    public async postData(@response() res: express.Response, @requestBody() body: any, @queryParam('url') url?: string): Promise<any> {
        console.log('POST /data request received with body:', body);
        try {
            const records = await this.dataService.fetchAndParse(url);
            if (!Array.isArray(records)) return res.status(400).json({ error: 'Dataset did not produce an array of records' });
            const filtered = this.dataService.applyFilter(records, body);
            return res.status(200).json(filtered);
        } catch (err: any) {
            return res.status(500).json({ error: err?.message || String(err) });
        }
    }
}
