import express from 'express';
import cors from 'cors';
import logger from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import bodyParser from "body-parser";
import * as dotenv from 'dotenv'
import { initDatabase } from './storage/dbMethods.js';

import indexRouter from './routes/index.js';
import apiRouter from './routes/api.js';

dotenv.config()
const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());
app.use(helmet.contentSecurityPolicy({
  useDefaults: true,
  directives: {
    "img-src": ["https: data:"],
    "script-src": ["'self'", "'unsafe-inline'",]
  }
}));
app.use(compression());
app.use(logger('dev'));

app.use('/', indexRouter);
app.use('/api', apiRouter);

// catch wrong or empty request
app.use(function(req, res) {
  console.error(`Wrong request to url :${req.url}`);
  res.status(404).send('Page not found, or empty data in request was provided')
});

// Init database with initial sql script
await initDatabase();

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
