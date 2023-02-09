import { body, param, validationResult } from 'express-validator';
import {addNewUser, getUserById, getUsers} from '../models/usersModel.js';

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

    const { result, error } = await getUserById(req.params._id);

    if (!result || error) {
      res.status(404).json('User not found');
      return;
    }

    res.json(result);
  }
];

/**
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
export const getAllUsers = async (req, res) => {
  const { limit } = req.query;
  const { result, error } = await getUsers(limit);

  if (error) {
    res.status(400).json(`Get users error: ${error}`);
    return;
  }

  res.json(result);
}

