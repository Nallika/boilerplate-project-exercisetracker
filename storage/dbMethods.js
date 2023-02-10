import fs from 'node:fs';
import { Database } from 'sqlite-async';

import { checkTableAndFields, getOptions, getColumnsSelector, getDateSelector } from './dbHelpers.js'
import { SELECT_OPTIONS } from '../constants/index.js';

const dbFile = new URL('storage.db', import.meta.url).pathname;
const initSql = fs.readFileSync(new URL('init.sql', import.meta.url).pathname,"utf-8");

/**
 * Open database and execute provided command
 * @param {Function} command
 * @returns {Promise<*>}
 */
const executeDbCommand = async (command) => {
  let db;
  let result = {};

  try {
    db = await Database.open(dbFile);
    result = await command(db);
  } catch (error) {
    result.error = error;
    console.error(`Error when try to execute db command: ${error}`);
  } finally {
    db.close();
  }

  return result;
}

/**
 * Initialize database with init.sql
 */
const initDatabase = async () => {
  await executeDbCommand(async (db) => {
    await db.exec(initSql);
  });
};

/**
 * Put provided data to provided table
 * @param {String} tableName
 * @param {Object} data
 * @returns {Promise<{error, lastID}>}
 */
const putData = async (tableName, data) => {
  const columns = Object.keys(data);
  const values = Object.values(data);

  return await executeDbCommand(async (db) => {
    const { isValid, error } = await checkTableAndFields(db, tableName, data);

    if (isValid) {
      const placeholders = new Array(values.length).fill('?');

      const {lastID, changes} = await db.run(
        `INSERT INTO ${tableName} (${columns.join(',')}) VALUES (${placeholders.join(',')});`, values
      );

      return {
        result: lastID,
        error: !changes ? 'Data was not inserted, check input' : ''
      };
    }

    return { error };
  });
};

/**
 * Get record from provided table, search by provided field and value
 * @param {String} tableName
 * @param {Object} data
 * @returns {Promise<*>}
 */
const getOneByParam = async (tableName, data) => {
  return await executeDbCommand(async (db) => {
    const { isValid, error } = await checkTableAndFields(db, tableName, data);

    if(isValid) {
      const result = await db.get(`SELECT * FROM ${tableName} ${getColumnsSelector(data)};`);
      return { result };
    }

    return { error };
  });
};

/**
 * Get all columns from provided table
 * @param {String} tableName
 * @param {Object} options
 * @returns {Promise<*>}
 */
const getAll = async (tableName, options = {}) => {
  return await executeDbCommand(async (db) => {
    const sortingColumn = options[SELECT_OPTIONS.order]?.column;
    const { isValid, error } = await checkTableAndFields(db, tableName, {[sortingColumn]: ''});

    if(isValid) {
      const result = await db.all(`SELECT * FROM ${tableName} ${getOptions(options)};`);
      return { result };
    }

    return { error };
  });
};

/**
 * Get all records from provided table, search by provided field and value
 * @param {String} tableName
 * @param {Object} data
 * @param {Object} options
 * @returns {Promise<*>}
 */
const getAllByParam = async (tableName, data, options) => {
  return await executeDbCommand(async (db) => {
    const sortingColumn = options[SELECT_OPTIONS.order]?.column;
    const { isValid, error } = await checkTableAndFields(db, tableName, {...data, [sortingColumn]: ''})

    if(isValid) {
      const result = await db.all(
        `SELECT * FROM ${tableName} ${getColumnsSelector(data)} ${getOptions(options)};`
      );

      return { result };
    }

    return { error };
  });
};

/**
 * Get all records from provided table, search by provided field, value and date
 * @param {String} tableName
 * @param {Object} data
 * @param {String} from
 * @param {String} to
 * @param {Object} options
 * @returns {Promise<*>}
 */
const getAllByParamAndDate = async (tableName, data, from, to, options) => {

  return await executeDbCommand(async (db) => {
    const sortingColumn = options[SELECT_OPTIONS.order]?.column;
    const { isValid, error } = await checkTableAndFields(db, tableName, {...data, [sortingColumn]: ''});

    if(isValid) {
      const result = await db.all(
        `with cte as (select count(*) total from ${tableName})
         SELECT *, (select total from cte) total FROM ${tableName} ${getColumnsSelector(data)} ${getDateSelector(from, to)} ${getOptions(options)};`
      );

      return { result };
    }

    return { error };
  });
};


export { initDatabase, putData, getAll, getOneByParam, getAllByParam, getAllByParamAndDate };