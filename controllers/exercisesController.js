import { body, param, query, validationResult } from 'express-validator';
import { processExercise, getLogs, getExercisesList } from '../models/exercisesModel.js';

/**
 * @type {(ValidationChain|(function(*, *): Promise<*|undefined>)|*)[]}
 */
export const addExercises = [
  param('_id').isNumeric().not().isEmpty().trim().escape(),
  body('description').isString().not().isEmpty().trim().escape(),
  body('duration').isNumeric(),
  body('date').optional(),

  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { result, error } = await processExercise({
      ...req.body,
      id: req.params._id,
    });

    if (error) {
      res.status(400).send(error);
      return;
    }

    res.send(result);
  }
];

/**
 * @type {(ValidationChain|(function(*, *): Promise<*|undefined>)|*)[]}
 */
export const getExercisesLogs = [
  param('_id').isNumeric().not().isEmpty().trim().escape(),
  query('from').optional(),
  query('to').optional(),
  query('limit').optional(),

  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { result, error } = await getLogs({
      query: req.query,
      id: req.params._id,
    });

    if (error) {
      res.status(400).send(error);
      return;
    }

    res.json(result);
  }
];

export const getAllExercises = async (req, res) => {
  const { limit } = req.query;
  const { result, error } = await getExercisesList(limit);

  if (error) {
    res.status(400).json(`Get exercises error ${error}`);
    return;
  }

  res.json(result);
}