import { camelCase, isInteger, isString } from 'lodash';

import { inject, injectable } from '../../ioc';
import { IConfig, ConfigToken } from '../config/config.interface';
import { Field, FieldTypeInfo, Filter, IDataService } from './data.interface';
import { compareEq, compareGt, compareLt, isLikeBoolean, isLikeDate, normalizeEmpty } from '../../utils';

@injectable()
export class DataService implements IDataService {

    @inject(ConfigToken)
    private config: IConfig;

    public async fetchAndParse(url: string): Promise<any[]> {
        if (!url && !this.config.dataSource) throw new Error('No data source specified');
        const resp = await fetch(url || this.config.dataSource);
        if (!resp.ok) throw new Error(`Failed to fetch dataset: ${resp.status} ${resp.statusText}`);
        const text = await resp.text();
        const ct = (resp.headers.get('content-type') || '').toLowerCase();
        if (ct.includes('application/json')) {
            const json = JSON.parse(text);
            if (Array.isArray(json)) return json;
            throw new Error('Unable to interpret JSON response as array of records');
        }
        throw new Error('Unable to parse JSON response from dataset URL');
    }

    public inferSchema(records: any[]): Field[] {
        if (!records || records.length === 0) return [];
        const dictionary: Record<string, any[]> = {};

        for (const r of records) {
            Object.keys(r || {}).forEach(k => {
                const normalizedValue = normalizeEmpty(r[k]);
                dictionary[k] ? dictionary[k].push(normalizedValue) : dictionary[k] = [normalizedValue];
            });
        }
        const fields: Field[] = [];
        for (const [originalName, values] of Object.entries(dictionary)) {
            const typeInfo = this.decideType(values);
            fields.push({ display: originalName, name: camelCase(originalName), originalName, type: typeInfo.type, options: typeInfo.options });
        }
        return fields;
    }

    private decideType(values: any[]): FieldTypeInfo {
        const nonNull = values.filter(v => v !== null && v !== undefined);

        const dictionary = new Set<string>();
        for (const v of nonNull) {
            if (!isString(v) || isLikeDate(v) || isLikeBoolean(v)) break;
            dictionary.add(v.toLowerCase().trim());
            if (dictionary.size > 6) {
                dictionary.clear();
                break;
            }
        }

        if (dictionary.size > 0 && dictionary.size < 7) {
            return { type: 'OPTION', options: [...dictionary] };
        }

        let allInt = true, allFloat = true, allBool = true, allDate = true, allStr = true;
        for (const v of nonNull) {
            const n = Number(String(v).trim());

            if (!isString(v)) allStr = false;
            if (isNaN(n)) { allInt = false; allFloat = false; }
            else { if (!isInteger(n)) allInt = false; }

            if (!isLikeBoolean(v)) allBool = false;
            if (!isLikeDate(v)) allDate = false;
        }

        if (allInt) return { type: 'INTEGER' };
        if (allFloat) return { type: 'FLOAT' };
        if (allBool) return { type: 'BOOLEAN' };
        if (allDate) return { type: 'DATE' };
        return { type: 'TEXT' };
    }

    public applyFilter(records: any[], filter: Filter): any[] {
        let filtered: any[] = [];
        const where = (filter && filter.where) || {};
        for (const r of records) {
            for (const [key, value] of Object.entries(r)) {
                let isCandidate = false;
                for (const [fieldName, clause] of Object.entries(where)) {
                    if (key === fieldName) {
                        if (clause['eq'] && compareEq(value, clause['eq'])) {
                            isCandidate = true;
                        } else if (clause['gt'] && compareGt(value, clause['gt'])) {
                            isCandidate = true;
                        } else if (clause['lt'] && compareLt(value, clause['lt'])) {
                            isCandidate = true;
                        } else {
                            isCandidate = false;
                        }
                    } else {
                        isCandidate = false;
                    }
                }
                if (isCandidate) filtered.push(r);
            }
        }
        return filtered;
    }
}
