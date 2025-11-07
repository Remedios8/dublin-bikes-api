export const ConfigToken = Symbol.for('Config');

export interface IConfig {
    port: number;
    dataSource: string;
}
