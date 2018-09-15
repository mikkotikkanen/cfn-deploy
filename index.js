const { EventEmitter } = require('events');
const AWS = require('aws-sdk');
const loadFiles = require('./libs/loadFiles');
const validateTemplate = require('./libs/cloudformation/validateTemplate');
const validateStackState = require('./libs/cloudformation/validateStackState');
const createChangeSet = require('./libs/cloudformation/createChangeSet');
const executeChangeSet = require('./libs/cloudformation/executeChangeSet');
const deleteChangeSet = require('./libs/cloudformation/deleteChangeSet');


module.exports = (args) => {
  const events = new EventEmitter();
  let templateBody;

  // Set AWS config
  AWS.config.update({
    region: args.region,
    accessKeyId: args.accessKey,
    secretAccessKey: args.secretKey,
  });

  // Start with empty promise so that there is no immediate call and event emitter returns first
  new Promise(resolve => resolve())
    // Load files
    .then(() => loadFiles(args.template, args.parameters, events))

    // Validate template
    .then((templateBodyString) => {
      templateBody = templateBodyString;
      return validateTemplate(templateBody, events);
    })

    // Make sure stack is ready
    .then(() => validateStackState(args.stackName, events))
    .then(() => deleteChangeSet(args.stackName, 'cfn-deploy'))

    // Deploy template
    .then(() => createChangeSet(args, templateBody, {}, events))
    .then(changesetData => executeChangeSet(args.stackName, changesetData.ChangeSetId, events))

    // All done
    .then((deployData) => {
      const type = (deployData.Stacks[0].StackStatus === 'CREATE_COMPLETE' ? 'CREATE' : 'UPDATE');
      events.emit('COMPLETE', { type });
    })

    // Handle errors
    .catch(err => events.emit('ERROR', err));

  return events;
};
