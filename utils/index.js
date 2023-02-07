import { TYPES_MAP } from '../constants/index.js'

/**
 * Compare js types to db types, return true if types match and can be inserted in db
 * @param {String} type
 * @param {String} columnType
 * @returns {boolean}
 */
export const checkType = (type, columnType) => {
  const dataType = TYPES_MAP[type];

  if (Array.isArray(dataType)) {
    return dataType.some((typeItem) => columnType.startsWith(typeItem));
  }

  return columnType.startsWith(dataType);
}