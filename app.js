import express from 'express';
import cors from 'cors';
import logger from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import bodyParser from "body-parser";
import createError from 'http-errors';
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

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  console.log('catch 404 and forward to error handler');
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Init database with initial sql script
await initDatabase();

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
