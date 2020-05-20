const { EventEmitter } = require('events');
const AWS = require('aws-sdk');

const loadTemplateFile = require('./libs/loadTemplateFile');
const parseParameters = require('./libs/parseParameters');
const parseTags = require('./libs/parseTags');
const validateTemplate = require('./libs/cloudformation/validateTemplate');
const describeStack = require('./libs/cloudformation/describeStack');
const validateStackState = require('./libs/cloudformation/validateStackState');
const createChangeSet = require('./libs/cloudformation/createChangeSet');
const executeChangeSet = require('./libs/cloudformation/executeChangeSet');
const deleteChangeSet = require('./libs/cloudformation/deleteChangeSet');


module.exports = (args) => {
  const events = new EventEmitter();
  let templateString = '';
  let paramsObj = {};
  let tagsObj = {};
  let stackData = {};
  let changeSetData = {};

  // Set AWS config
  if (args.profile) {
    const creds = new AWS.SharedIniFileCredentials({ profile: args.profile });
    AWS.config.credentials = creds;
  }
  AWS.config.update({
    region: args.region,
    accessKeyId: args.accesskey,
    secretAccessKey: args.secretkey,
  });

  // Start with empty promise so that there is no immediate call and event emitter returns first
  new Promise((resolve) => resolve())
    // Load files
    .then(() => events.emit('LOADING_FILES'))
    .then(() => args.templateString && args.templateString.length 
      ? Promise.resolve(args.templateString) 
      : loadTemplateFile(args.template))
    .then((newTemplateString) => { templateString = newTemplateString; })

    // Parse params & tags
    .then(() => parseParameters(args.parameters))
    .then((newParamsObj) => { paramsObj = newParamsObj; })
    .then(() => parseTags(args.tags))
    .then((newTagsObj) => { tagsObj = newTagsObj; })

    // Validate template
    .then(() => events.emit('VALIDATING_TEMPLATE'))
    .then(() => validateTemplate(templateString))

    // Validate stack state
    .then(() => events.emit('VALIDATING_STACKSTATE'))
    .then(() => validateStackState(args.stackname))
    .then((newStackData) => { stackData = newStackData; })
    .then(() => deleteChangeSet(args.stackname, 'cfn-deploy'))

    // Create changeset
    .then(() => events.emit('CREATING_CHANGESET', { type: (stackData ? 'UPDATE' : 'CREATE') }))
    .then(() => createChangeSet(args, templateString, paramsObj, tagsObj))
    .then((newChangeSetData) => { changeSetData = newChangeSetData; })

    // Execute changeset
    .then(() => events.emit('EXECUTING_CHANGESET', { type: (stackData ? 'UPDATE' : 'CREATE') }))
    .then(() => executeChangeSet(args.stackname, changeSetData.ChangeSetId))

    // Get new stack status
    .then(() => describeStack(args.stackname))

    // Done
    .then((newStackData) => {
      events.emit('COMPLETE', newStackData);
      events.emit('FINALLY');
    })

    // Handle errors
    .catch((err) => {
      events.emit('ERROR', err);
      events.emit('FINALLY');
    });

  return events;
};
