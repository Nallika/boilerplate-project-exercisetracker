import { TYPES_MAP, SELECT_OPTIONS, ORDER_TYPES } from '../constants/index.js';

/**
 * Compare js types to db types, return true if types match and can be inserted in db
 * @param {String} type
 * @param {String} columnType
 * @returns {boolean}
 */
const checkType = (type, columnType) => {
  const dataType = TYPES_MAP[type];

  if (Array.isArray(dataType)) {
    return dataType.some((typeItem) => columnType.startsWith(typeItem));
  }

  return columnType.startsWith(dataType);
}

/**
 * Check is provided table exist, is it has provided columns,
 * and is provided data match column types
 * @param db
 * @param {String} tableName
 * @param {Object} data
 * @returns {Promise<{isValid: boolean, error: string}>}
 */
export const checkTableAndFields = async (db, tableName, data = {}) => {
  const result = {
    isValid: false,
    error: ''
  };

  const columns = Object.keys(data);
  // Get table info
  const tableScheme = await db.all(`PRAGMA table_info(${tableName});`);

  // Check table
  if (!tableScheme || !tableScheme.length) {
    result.error = `no such table: ${tableName}`;
    return result;
  }

  // If no columns passed return true
  if (!columns) {
    result.isValid = true;
    return result;
  }

  let tableFieldsTypesMap = {};
  tableScheme.forEach(({name, type}) => tableFieldsTypesMap[name] = type);

  // Check columns and values
  columns.forEach((column) => {
    const columnType = tableFieldsTypesMap[column];

    if (!columnType) {
      result.error = `try to access wrong column: ${column}, from table: ${tableName}`;
      return;
    }

    // If no values return true
    if (!data[column]) {
      result.isValid = true;
      return;
    }

    const value = data[column];

    // check type
    if (!checkType(typeof value, columnType)) {
      result.error = `attempt to insert data: ${value} in column: ${column}, from table: ${tableName}`;
      return;
    }

    // if all checks passed return true
    result.isValid = true;
  });

  return result;
}

/**
 * @param data
 * @returns {string}
 */
export const getColumnsSelector = (data) => {
  let result = '';
  const columnsList = Object.keys(data);

  if (!columnsList.length) {
    return result;
  }

  result = ' WHERE ';

  columnsList.forEach((column, index, list) => {
    const value = data[column];
    const isNextExists = !!list[index + 1];
    result += `${column} = "${value}" ${isNextExists ? 'AND ' : ''}`;
  });

  return result;
};

/**
 * @param from
 * @param to
 * @param columnName
 * @param firstSelector
 * @returns {string}
 */
export const getDateSelector = (from, to, columnName = 'date', firstSelector = false) => {
  let start = firstSelector ? ' WHERE' : ' AND';

  if (from && to) {
    return `${start} ${columnName} BETWEEN "${from}" AND "${to}"`;
  }

  if (from) {
    return `${start} ${columnName} >= "${from}"`;
  }

  if (to) {
    return `${start} ${columnName} <= "${to}"`;
  }

  return '';
};

/**
 * By provided attributes return sql select options string with order and limit options.
 * @param options
 * @returns {string}
 */
export const getOptions = (options) => {
  let result = '';

  if (options[SELECT_OPTIONS.order]) {
    const { column, type } = options[SELECT_OPTIONS.order];
    const sortType = ORDER_TYPES[type] ? ORDER_TYPES[type] : '';
    result += ` ORDER BY ${column} ${sortType}`;
  }

  if (options[SELECT_OPTIONS.limit]) {
    const limit = options[SELECT_OPTIONS.limit];

    if (limit) {
      result += ` LIMIT ${limit}`;
    }
  }

  return result;
}
