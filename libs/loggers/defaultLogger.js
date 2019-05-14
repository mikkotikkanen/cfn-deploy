const chalk = require('chalk');
const logUpdate = require('log-update');
const pckg = require('../../package.json');

const awsOrange = '#ff9900';
let progressBarTimer;
let isProgressBarRunning = false;


/**
 * Start/stop progressbar
 *
 * Note: Use logUpdate.default & chalk.default to make TS checkJs happy
 */
const startProgressBar = () => {
  let progressBarDots = chalk.default.hex(awsOrange)('.');
  logUpdate.default(progressBarDots);

  progressBarTimer = setInterval(() => {
    progressBarDots += chalk.default.hex(awsOrange)('.');
    logUpdate.default(progressBarDots);
  }, 5 * 1000);

  isProgressBarRunning = true;
};
const stopProgressBar = () => {
  clearInterval(progressBarTimer);
  logUpdate.default.done();

  isProgressBarRunning = false;
};


/**
 * Log message to cli
 *
 * Note: Use chalk.default to make TSC happy
 *
 * @param {String} msg Log message
 */
const log = (msg) => {
  if (isProgressBarRunning) {
    stopProgressBar();
  }

  // Use Amazon orange for the logging
  console.log(`${pckg.name}: ${chalk.default.hex(awsOrange)(msg)}`);
};


/**
 * Log error message to cli
 *
 * Note: Use chalk.default to make TSC happy
 *
 * @param {String} msg Log error message
 */
const error = (msg) => {
  if (isProgressBarRunning) {
    stopProgressBar();
  }

  // Use red for errors
  console.log(`${pckg.name}: ${chalk.default.red(msg)}`);
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
  events.on('COMPLETE', (stackState) => {
    log('Deployment complete...');
    if (stackState.Outputs) {
      console.log('');
      console.log('Outputs:');
      stackState.Outputs.forEach((item) => {
        console.log(`${chalk.default.grey(item.OutputKey)} = ${chalk.default.grey(item.OutputValue)}`);
      });
    }
    console.log('');
  });
  events.on('ERROR', (err) => {
    error(err.message);
    if (args.debug) {
      console.log(err.stack);
    }
  });
};
