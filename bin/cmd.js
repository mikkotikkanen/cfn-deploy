#!/usr/bin/env node
const yargs = require('yargs');
const index = require('../index');
const defaultLogger = require('../libs/loggers/default');


yargs
  .option('stack-name', {
    describe: 'The name that is associated with the stack',
  })
  .option('template', {
    describe: 'Path or url to template file',
  })
  .option('region', {
    describe: 'Specifies the AWS region',
    default: 'us-east-1',
  })
  .version()
  .help()
  .demandOption(['stack-name', 'template']);

// Remove boolean texts from "help" and "version" options in help view
yargs.getOptions().boolean.splice(-2);


// Call the library with cli arguments
const args = yargs.argv;
const events = index(args);

// Start logger
defaultLogger(args, events);
