import express from 'express';
import path from 'node:path';

const router = express.Router();

router.get('/', (req, res) => {
  res.sendFile(path.resolve('views', 'index.html'));
});

export default router;