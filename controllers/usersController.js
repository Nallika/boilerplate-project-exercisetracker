import { body, param, validationResult } from 'express-validator';
import { addNewUser, getUserById } from '../models/usersModel.js';

/**
 * @type {(ValidationChain|(function(*, *): Promise<*|undefined>)|*)[]}
 */
export const addUser = [
  body('username').isString().not().isEmpty().trim().escape(),

  async (req, res) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      return res.status(400).json({ errors: validationErrors.array() });
    }

    const { username } = req.body;
    const {result, error} = await addNewUser(username);

    if (error) {
      res.status(400).json(error);
      return;
    }

    res.json(result);
  }
];

/**
 * @type {(ValidationChain|(function(*, *): Promise<*|undefined>)|*)[]}
 */
export const getUser = [
  param('_id').not().isEmpty().trim().escape(),

  async (req, res) => {

    if(!req.params)
      return res.send("NO PARAMS PASSED")

    const user = await getUserById(req.params._id);

    if (!user) {
      res.status(404).json('User not found');
      return;
    }

    res.json(user);
  }
];

