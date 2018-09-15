const { EventEmitter } = require('events');
const loadFiles = require('./libs/loadFiles');
const validateTemplate = require('./libs/cloudformation/validateTemplate');
const validateStackState = require('./libs/cloudformation/validateStackState');
const createChangeset = require('./libs/cloudformation/createChangeset');
const executeChangeset = require('./libs/cloudformation/executeChangeset');
const deleteChangeSet = require('./libs/cloudformation/deleteChangeSet');


module.exports = (args) => {
  const events = new EventEmitter();
  let templateBody;

  // Start with empty promise so that there is no immediate call and event emitter gets to return
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
    .then(() => createChangeset(args, templateBody, {}, events))
    .then(changesetData => executeChangeset(args.stackName, changesetData.ChangeSetId, events))

    // All done
    .then((deployData) => {
      const type = (deployData.Stacks[0].StackStatus === 'CREATE_COMPLETE' ? 'CREATE' : 'UPDATE');
      events.emit('DEPLOY_FINISHED', { type });
    })

    // Handle errors
    .catch(err => events.emit('ERROR', err));

  return events;
};
