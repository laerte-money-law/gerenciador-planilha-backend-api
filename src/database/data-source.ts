import { DataSource } from 'typeorm';
import { DataSourceOptions } from 'typeorm';

const dataSourceOptions: DataSourceOptions = {
  type: 'mssql',
  host: 'localhost',
  port: 1433,
  username: 'sa',
  password: '',
  database: '',
  synchronize: false,
  logging: true,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  entities: [__dirname + '/../**/*.entity.{ts,js}'],
  migrations: [__dirname + '/../migrations/*.{ts,js}'],
};

export default new DataSource(dataSourceOptions);
