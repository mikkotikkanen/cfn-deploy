#!/usr/bin/env node
const yargs = require('yargs');
const updateNotifier = require('update-notifier');
const isInstalledGlobally = require('is-installed-globally');
const pckg = require('../package.json');
const index = require('../index');
const defaultLogger = require('../libs/loggers/defaultLogger');


yargs
  .option('stack-name', {
    describe: 'The name associated with the stack',
  })
  .option('template', {
    describe: 'Path to template file',
  })
  .option('parameters', {
    describe: 'Path(s) to parameter file(s) (.json)',
  })
  .option('region', {
    describe: 'AWS region',
    default: 'us-east-1',
  })
  .option('capabilities', {
    describe: 'IAM capabilities',
  })
  .option('profile', {
    describe: 'Load profile from shared credentials file',
  })
  .option('access-key', {
    describe: 'AWS Access Key',
  })
  .option('secret-key', {
    describe: 'AWS Secret Access Key',
  })
  .version()
  .help()
  .demandOption(['stack-name', 'template']);

// Remove "[boolean]" texts from "help" and "version" options in help view
yargs.getOptions().boolean.splice(-2);


// Set update notifier
updateNotifier({
  pkg: pckg,
  updateCheckInterval: 0,
  isGlobal: isInstalledGlobally,
}).notify();


// Call the library with cli arguments
const args = yargs.argv;
const events = index(args);

// Start logger
defaultLogger(args, events);


// Exit process properly on error
let hasErrored = false;
events.on('ERROR', () => {
  hasErrored = true;
});

events.on('FINALLY', () => {
  if (hasErrored) {
    process.exit(1);
  }
});
