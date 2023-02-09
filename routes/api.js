import express from 'express';
import { addUser, getUser } from '../controllers/usersController.js';
import { addExercises, getExercisesLogs } from '../controllers/exercisesController.js';

const router = express.Router();

router.post('/users', addUser);

router.post('/users/:_id/exercises', addExercises);

router.get('/users/:_id', getUser);

router.get('/users/:_id/logs', getExercisesLogs);

export default router