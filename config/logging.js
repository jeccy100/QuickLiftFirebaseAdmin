let winston = require('winston');
var moment = require('moment');
require('winston-daily-rotate-file');

const appendTimestamp = winston.format((info, opts) => {
  if(opts.tz)
    info.timestamp = moment().tz(opts.tz).format();
  return info;
});
 
let logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        appendTimestamp({ tz: 'Asia/Calcutta' }),
        winston.format.printf(info => {
            return `${info.timestamp} ${info.level}: ${info.message}`;
        }),
		winston.format.colorize()
    ),
   transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log` 
    // - Write all logs error (and below) to `error.log`.
    //
	// new winston.transports.Console(),
  //  new winston.transports.File({ filename: 'logs/error_'+date_time+'.log', level: 'error' }),
    //new winston.transports.File({ filename: 'logs/combined_'+date_time+'.log' })
	new (winston.transports.DailyRotateFile)({
    filename: 'logs/combined-%DATE%.log',
    datePattern: 'DD-MM-YYYY',
    zippedArchive: false,
    maxSize: '20m',
    maxFiles: '14d',
	level: 'info'
  }),
  
  new (winston.transports.DailyRotateFile)({
    filename: 'logs/error-%DATE%.log',
    datePattern: 'DD-MM-YYYY',
    zippedArchive: false,
    maxSize: '20m',
    maxFiles: '14d',
	level: 'error'
  })
  ]
});

 module.exports = logger