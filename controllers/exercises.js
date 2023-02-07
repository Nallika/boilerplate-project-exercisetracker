import { body, query, validationResult } from 'express-validator';
import { processExercise, getExercises } from '../models/exercisesModel.js';

/**
 * @type {(ValidationChain|(function(*, *): Promise<*|undefined>)|*)[]}
 */
export const addExercises = [
  body(':_id').isNumeric().not().isEmpty().trim().escape(),
  body('description').isString().not().isEmpty().trim().escape(),
  body('duration').isNumeric(),
  body('date').optional(),

  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const result = await processExercise(req.body);

    res.send(result);
  }
];

/**
 * @type {(ValidationChain|(function(*, *): Promise<*|undefined>)|*)[]}
 */
export const getExercisesLogs = [
  query(':_id').isNumeric().not().isEmpty().trim().escape(),
  query('from').optional(),
  query('to').optional(),
  query('limit').optional(),

  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    res.send(await getExercises(req.query));
  }
];