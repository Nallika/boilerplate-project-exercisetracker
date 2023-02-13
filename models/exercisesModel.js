import {putData, getOneByParam, getAll, getAllByParamAndDate} from '../storage/dbMethods.js';
import { getUserById } from './usersModel.js'
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
  const { result: user, error: userError } = await getUserById(userId);

  if (!user || userError) {
    return {
      error: `Error when add exercise: there is no user with id = ${userId}`
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
 *
 * @param id
 * @param query
 * @returns {Promise<{error: string}|{result: {[p: string]: *}}>}
 */
export const getLogs = async ({id, query}) => {
  const userId = Number(id);
  const { from, to, limit } = query;

  const {result: user, error: userError} = await getUserById(userId);

  if (!user || userError) {
    return {
      error: `Error when retrieving user logs: there is no user with id = ${userId}`
    };
  }

  const fromDate = from ? formatDate(from) : '';
  const toDate = to ? formatDate(to) : '';
  const {result: exercises, error } = await getExercises({userId, fromDate, toDate, limit })

  if (error) {
    return {
      error: `Error when retrieving user logs: ${error}`
    };
  }

  const count = exercises[0]?.total || 0;

  return {
    result: {
      userId: user.id,
      username: user.name,
      logs: parseExercises(exercises),
      count
    }
  }
}

/**
 * @param {String | Number} num
 * @returns {Number|string}
 */
const addZero = (num) => String(num).length > 1 ? num : '0'+num;

/**
 * @param {String} dateString
 * @returns {String}
 */
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = addZero(date.getDate());
  const month = addZero(date.getMonth() + 1);

  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * format exercises
 * @param exercises
 * @returns {Array}
 */
const parseExercises = (exercises) => {
  return exercises.map(({id, date, description, duration}) => ({
    id,
    date,
    description,
    duration
  }))
}

/**
 * Ge exercises by user and optionally by provided date
 * @param data
 * @returns {Promise<*>}
 */
const getExercises = async ({ userId, fromDate, toDate, limit }) => {
  return await getAllByParamAndDate(
    'Exercises',
    {userId},
    fromDate,
    toDate,
    {limit, order: {column: 'date', type: ORDER_TYPES.ASC}},
    true
  );
}

/**
 * Get all users
 * @returns {Promise<*>}
 */
export const getExercisesList = async (limit) => {
  return await getAll('Exercises', {limit, order: { column: 'date', type: ORDER_TYPES.DESC }});
}