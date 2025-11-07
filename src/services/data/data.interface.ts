export type FieldType = 'INTEGER' | 'FLOAT' | 'BOOLEAN' | 'DATE' | 'TEXT' | 'OPTION';

export interface Field {
    display: string;
    name: string;
    originalName: string;
    type: FieldType;
    options: any[];
}

export interface FieldTypeInfo {
    type: FieldType;
    options?: any[];
}

export interface Filter {
    where: Record<string, Record<'eq' | 'gt' | 'lt', any>>;
}


export interface IDataService {
    fetchAndParse(url: string): Promise<any[]>;
}