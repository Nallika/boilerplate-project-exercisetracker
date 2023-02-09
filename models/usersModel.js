import { putData, getOneByParam } from '../storage/dbMethods.js';
import { UNIQUE_FIELD_ERROR } from '../constants/index.js'

/**
 * Add new user with provided name if it uniq
 * @param name
 * @returns {Promise<string|string|*>}
 */
export const addNewUser = async (name) => {
  // Set user to db
  const {error, lastID} = await putData('Users', {name});

  if (error) {
    return {
      error: error.code === UNIQUE_FIELD_ERROR ?
        `Can't add user with name: "${name}" it already exists` :
        'Add user error'
    };
  }

  // return just added user from db
  const result = await getOneByParam('Users', 'id', lastID);

  return { result };
}

/**
 * Gwt user by id
 * @param id
 * @returns {Promise<string|string|*>}
 */
export const getUserById = async (id) => {
  return await getOneByParam('Users', 'id', Number(id));
}