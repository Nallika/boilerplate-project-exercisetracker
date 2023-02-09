import { body, param, query, validationResult } from 'express-validator';
import { processExercise, getExercises } from '../models/exercisesModel.js';

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

    const userId = req.params._id;

    const { result, error } = await processExercise({
      userId,
      ...req.body
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

    const userId = req.params.id;

    const exercises = await getExercises({
      userId,
      ...req.query
    });

    res.json(exercises);
  }
];