#!/usr/bin/env node
const yargs = require('yargs');
const index = require('../index');
const defaultLogger = require('../libs/loggers/defaultLogger');


yargs
  .option('stack-name', {
    describe: 'The name associated with the stack',
  })
  .option('template', {
    describe: 'Path or url to template file',
  })
  .option('region', {
    describe: 'AWS region',
    default: 'us-east-1',
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


// Call the library with cli arguments
const args = yargs.argv;
const events = index(args);

// Start logger
defaultLogger(args, events);
