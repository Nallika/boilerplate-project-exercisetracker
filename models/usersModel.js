import { putData, getOneByParam, getAll } from '../storage/dbMethods.js';
import { UNIQUE_FIELD_ERROR } from '../constants/index.js'
import { ORDER_TYPES } from '../constants/index.js';

/**
 * Add new user with provided name if it uniq
 * @param name
 * @returns {Promise<string|string|*>}
 */
export const addNewUser = async (name) => {
  // Set user to db
  const {error, result: lastID} = await putData('Users', {name});

  if (error) {
    return {
      error: error.code === UNIQUE_FIELD_ERROR ?
        `Can't add user with name: "${name}" it already exists` :
        'Add user error'
    };
  }

  // return just added user from db
  return await getOneByParam('Users', {id: lastID});
}

/**
 * Get user by id
 * @param id
 * @returns {Promise<string|string|*>}
 */
export const getUserById = async (id) => {
  return await getOneByParam('Users', {id: Number(id)});
}

/**
 * Get all users
 * @returns {Promise<*>}
 */
export const getUsers = async (limit) => {
  return await getAll('Users', {limit, order: { column: 'name', type: ORDER_TYPES.DESC }});
}