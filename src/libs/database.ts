import { Sequelize } from 'sequelize-typescript';
import pg from 'pg';
import dotenv from 'dotenv';
import { Gadget } from '../gadgetModel';

dotenv.config();

pg.types.setTypeParser(pg.types.builtins.INT8, (value) => parseInt(value, 10));

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined in the environment variables');
}

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  // logging: console.log,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  models: [Gadget]
});

export default sequelize;