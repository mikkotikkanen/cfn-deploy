const chalk = require('chalk');
const logUpdate = require('log-update');
const pckg = require('../../package.json');

const awsOrange = '#ff9900';
let progressBarTimer;
let isProgressBarRunning = false;


/**
 * Start/stop progressbar
 */
const startProgressBar = () => {
  let progressBarDots = chalk.hex(awsOrange)('.');
  logUpdate(progressBarDots);

  progressBarTimer = setInterval(() => {
    progressBarDots += chalk.hex(awsOrange)('.');
    logUpdate(progressBarDots);
  }, 5 * 1000);

  isProgressBarRunning = true;
};
const stopProgressBar = () => {
  clearInterval(progressBarTimer);
  logUpdate.done();

  isProgressBarRunning = false;
};


/**
 * Log message to cli
 *
 * @param {String} msg Log message
 */
const log = (msg) => {
  if (isProgressBarRunning) {
    stopProgressBar();
  }

  // Use Amazon orange for the logging
  console.log(`${pckg.name}: ${chalk.hex(awsOrange)(msg)}`);
};


/**
 * Log error message to cli
 *
 * @param {String} msg Log error message
 */
const error = (msg) => {
  if (isProgressBarRunning) {
    stopProgressBar();
  }

  // Use Amazon orange for the logging
  console.log(`${pckg.name}: ${chalk.red(msg)}`);
};


module.exports = (args, events) => {
  // Set event logging
  events.on('LOADING_FILES', () => {
    log('Loading files...');
  });
  events.on('VALIDATING_TEMPLATE', () => {
    log('Validating template...');
  });
  events.on('CREATING_CHANGESET', () => {
    log('Creating change set...');
    startProgressBar();
  });
  events.on('EXECUTING_CHANGESET', () => {
    log('Executing change set...');
    startProgressBar();
  });
  events.on('COMPLETE', () => {
    log('Deployment complete...');
  });
  events.on('ERROR', (err) => {
    error(err.message);
    if (args.debug) {
      console.log(err.stack);
    }
  });
};
