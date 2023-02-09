import express from 'express';
import { addUser, getUser, getAllUsers } from '../controllers/usersController.js';
import { addExercises, getExercisesLogs, getAllExercises } from '../controllers/exercisesController.js';

const router = express.Router();

router.post('/users', addUser);

router.get('/users/:_id', getUser);

router.get('/users', getAllUsers);

router.post('/users/:_id/exercises', addExercises);

router.get('/users/:_id/logs', getExercisesLogs);

router.get('/exercises', getAllExercises);

export default router