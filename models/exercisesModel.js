import {putData, getOneByParam, getAll, getAllByParam, getAllByParamDate} from '../storage/dbMethods.js';

/**
 * Add exercise to provided user if it exists
 * @param data
 * @returns {Promise<string|{[p: string]: *}>}
 */
export const processExercise = async (data) => {
  const { ':_id': id, description, duration, date } = data;
  const userId = Number(id);

  // check existence of user by provided id before search for exercises
  const user =  await getOneByParam('Users', 'id', userId);

  if (!user) {
    return `There is no user with id = ${userId}`;
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

  const { error, lastID} = await putData('Exercises', exercisesValues);

  if (error) {
    return `Error when adding exercise = ${error}`;
  }

  // get just added exercises and return alongside with linked user
  const exercise =  await getOneByParam('Exercises', 'id', lastID);

  return {
     ...user,
     ...exercise,
  }
}

/**
 * Ge exercises by user and optionally by provided date
 * @param data
 * @returns {Promise<*>}
 */
export const getExercises = async (data) => {
  const { ':_id': id, from, to, limit } = data;
  const userId = Number(id);
  let result;

  // If there are provided date range, use it for search exercises
  if (from && to) {
    result = await getAllByParamDate('Exercises', 'userId', userId, from, to, limit);
  // otherwise retrieve all exercises linked to provided user
  } else {
    result = await getAllByParam('Exercises', 'userId', userId, limit);
  }

  return {
    exercises: result,
    count: result.length
  };
}

export const getAllExercises = async () => {
  return await getAll('Exercises');
}