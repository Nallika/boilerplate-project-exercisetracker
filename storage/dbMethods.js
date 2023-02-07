import fs from 'node:fs';
import { Database } from 'sqlite-async';

import { checkType } from '../utils/index.js'

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
 * Check is provided table exist, is it has provided columns,
 * and is provided data match column types
 * @param db
 * @param {String} tableName
 * @param {Object} data
 * @returns {Promise<boolean>}
 */
const checkTableAndFields = async (db, tableName, data = {}) => {
  const columns = Object.keys(data);
  const tableScheme = await db.all(`PRAGMA table_info(${tableName});`);

  if (!tableScheme || !tableScheme.length) {
    throw new Error(`no such table: ${tableName}`);
  }

  if (!columns) {
    return true;
  }

  let tableFieldsTypesMap = {};
  tableScheme.forEach(({name, type}) => tableFieldsTypesMap[name] = type);

  columns.forEach((column) => {
    const columnType = tableFieldsTypesMap[column];

    if (!columnType) {
      throw new Error(`try to access wrong column: ${column}, from table: ${tableName}`);
    }

    if (!data) {
      return;
    }

    const value = data[column];

    if (!checkType(typeof value, columnType)) {
      throw new Error(`attempt to insert data: ${value} in column: ${column}, from table: ${tableName}`);
    }
  });

  return true;
}

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
    if (await checkTableAndFields(db, tableName, data)) {
      const placeholders = new Array(values.length).fill('?');

      const {lastID, changes} = await db.run(
        `INSERT INTO ${tableName} (${columns.join(',')}) VALUES (${placeholders.join(',')});`, values
      );

      return {
        lastID,
        error: !changes
      };
    }
  });
};

/**
 * Get record from provided table, search by provided field and value
 * @param {String} tableName
 * @param {String} column
 * @param {String | Number} value
 * @returns {Promise<*>}
 */
const getOneByParam = async (tableName, column, value) => {
  let result;

  await executeDbCommand(async (db) => {
    if(await checkTableAndFields(db, tableName,{[column]: value})) {
      result = await db.get(`SELECT * FROM ${tableName} WHERE ${column} = "${value}";`);
    }
  });

  return result;
};

/**
 * Get all columns from provided table
 * @param {String} tableName
 * @param {Number} limit
 * @returns {Promise<*>}
 */
const getAll = async (tableName, limit= 0) => {
  let result;

  await executeDbCommand(async (db) => {
    if(await checkTableAndFields(db, tableName)) {
      result = await db.all(`SELECT * FROM ${tableName} ${limit ? 'LIMIT '+limit : ''};`);
    }
  });

  return result
};

/**
 * Get all records from provided table, search by provided field and value
 * @param {String} tableName
 * @param {String} column
 * @param {String || Number} value
 * @param {Number} limit
 * @returns {Promise<*>}
 */
const getAllByParam = async (tableName, column, value, limit= 0) => {
  let result;

  await executeDbCommand(async (db) => {
    if(await checkTableAndFields(db, tableName, {[column]: value})) {

      result = await db.all(
        `SELECT * FROM ${tableName} WHERE ${column} = "${value}" ${limit ? 'LIMIT '+limit : ''};`
      );
    }
  });

  return result;
};

/**
 * Get all records from provided table, search by provided field, value and date
 * @param {String} tableName
 * @param {String} column
 * @param {String | Number} value
 * @param {String} dateFrom
 * @param {String} dateTo
 * @param {Number} limit
 * @returns {Promise<*>}
 */
const getAllByParamDate = async (tableName, column, value, dateFrom, dateTo, limit= 0) => {
  let result;

  await executeDbCommand(async (db) => {
    if(await checkTableAndFields(db, tableName, {[column]: value})) {
      result = await db.all(
        `SELECT *, COUNT(*) FROM ${tableName} WHERE ${column} = "${value}" AND date BETWEEN "${dateFrom}" AND "${dateTo}" ${limit ? 'LIMIT '+limit : ''};`
      );
    }
  });

  return result;
};


export { initDatabase, putData, getAll, getOneByParam, getAllByParam, getAllByParamDate };