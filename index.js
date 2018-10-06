const { EventEmitter } = require('events');
const AWS = require('aws-sdk');
const loadTemplateFile = require('./libs/loadTemplateFile');
const parseParameters = require('./libs/parseParameters');
const validateTemplate = require('./libs/cloudformation/validateTemplate');
const describeStack = require('./libs/cloudformation/describeStack');
const validateStackState = require('./libs/cloudformation/validateStackState');
const createChangeSet = require('./libs/cloudformation/createChangeSet');
const executeChangeSet = require('./libs/cloudformation/executeChangeSet');
const deleteChangeSet = require('./libs/cloudformation/deleteChangeSet');


module.exports = (args) => {
  const events = new EventEmitter();
  let templateString;
  let paramsObj;

  // Set AWS config
  if (args.profile) {
    const creds = new AWS.SharedIniFileCredentials({ profile: args.profile });
    AWS.config.credentials = creds;
  }
  AWS.config.update({
    region: args.region,
    accessKeyId: args.accessKey,
    secretAccessKey: args.secretKey,
  });

  // Start with empty promise so that there is no immediate call and event emitter returns first
  new Promise(resolve => resolve())
    // Load files
    .then(() => events.emit('LOADING_FILES'))
    .then(() => loadTemplateFile(args.template))
    .then((newTemplateString) => { templateString = newTemplateString; })
    .then(() => parseParameters(args.parameters))
    .then((newParamsObj) => { paramsObj = newParamsObj; })

    // Validate template
    .then(() => validateTemplate(templateString, events))

    // Make sure stack is ready
    .then(() => validateStackState(args.stackName, events))
    .then(() => deleteChangeSet(args.stackName, 'cfn-deploy'))

    // Deploy template
    .then(() => createChangeSet(args, templateString, paramsObj, events))
    .then(changesetData => executeChangeSet(args.stackName, changesetData.ChangeSetId, events))

    // Get new stack status
    .then(() => describeStack(args.stackName))

    // All done
    .then((stackData) => {
      const type = (stackData.StackStatus === 'CREATE_COMPLETE' ? 'CREATE' : 'UPDATE');
      events.emit('COMPLETE', { type });
      events.emit('FINALLY');
    })

    // Handle errors
    .catch((err) => {
      events.emit('ERROR', err);
      events.emit('FINALLY');
    });

  return events;
};
