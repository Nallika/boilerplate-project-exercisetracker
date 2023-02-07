import express from 'express';
import { addUser } from '../controllers/users.js';
import {addExercises, getExercisesLogs} from '../controllers/exercises.js';

const router = express.Router();

router.post('/users', addUser);

router.post('/users/:_id/exercises', addExercises);

router.get('/users/:_id/logs', getExercisesLogs);

export default router