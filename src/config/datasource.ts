import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'admin',
  password: 'password',
  database: 'sojourn_dev',
  synchronize: false,
  logging: false,
  entities: ['dist/**/*.entity'],
  migrations: ['dist/migrations/*.js'],
  subscribers: [],
});
