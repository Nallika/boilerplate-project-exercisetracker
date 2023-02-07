import { body, validationResult } from 'express-validator';
import { addNewUser } from '../models/usersModel.js';

/**
 * @type {(ValidationChain|(function(*, *): Promise<*|undefined>)|*)[]}
 */
export const addUser = [
  body('username').isString().not().isEmpty().trim().escape(),

  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username } = req.body;
    const result = await addNewUser(username);

    res.send(result);
  }
];

