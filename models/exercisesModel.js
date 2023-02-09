import {putData, getOneByParam, getAll, getAllByParamAndDate} from '../storage/dbMethods.js';
import { ORDER_TYPES } from '../constants/index.js';

/**
 * Add exercise to provided user if it exists
 * @param data
 * @returns {Promise<string|{[p: string]: *}>}
 */
export const processExercise = async (data) => {
  const { id, description, duration, date } = data;
  const userId = Number(id);

  // check existence of user by provided id before search for exercises
  const { result: user, error: userError } =  await getOneByParam('Users', {id: userId});

  if (!user || userError) {
    return {
      error: `There is no user with id = ${userId}`
    };
  }

  const exercisesValues = {
    userId,
    description,
    duration: Number(duration),
  };

  // date is optional and can be inserted in db as default
  if (date) {
    exercisesValues.date = date;
  }

  const { error: exercisesError, result: lastID} = await putData('Exercises', exercisesValues);

  if (exercisesError) {
    return {
      error: 'Error when adding exercise check input values'
    };
  }

  // get just added exercises and return alongside with linked user
  const {result: exercise, error} =  await getOneByParam('Exercises', {id: lastID});

  if (error) {
    return {
      error: 'Error when retrieving added exercise check input values'
    };
  }

  return {
    result: {
      ...user,
      ...exercise,
    }
  }
}

/**
 * Ge exercises by user and optionally by provided date
 * @param data
 * @returns {Promise<*>}
 */
export const getExercises = async (data) => {
  const { id, from, to, limit } = data;
  const userId = Number(id);

  const { result, error } = await getAllByParamAndDate(
    'Exercises',
    {userId},
    from,
    to,
    {limit, order: {column: 'date', type: ORDER_TYPES.ASC}}
  );

  if (error) {
    return {
      error: 'Retrieving exercises error, check input values'
    };
  }

  return {
    result,
    count: result.length
  };
}

/**
 * Get all users
 * @returns {Promise<*>}
 */
export const getExercisesList = async (limit) => {
  return await getAll('Exercises', {limit, order: { column: 'date', type: ORDER_TYPES.DESC }});
}