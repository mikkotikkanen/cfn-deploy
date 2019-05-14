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

  // Prepare plugins
  const runPlugins = plugins => Promise.all(plugins.map(fnc => fnc(events)));
  const plugins = [];
  plugins.push(require('./plugins/test-plugin')); /* eslint-disable-line node/no-unpublished-require, global-require */

  // Prepare hooks
  const hooks = {
    TEMPLATE_VALIDATE_PRE: [],
  };
  plugins.forEach((plugin) => {
    Object.keys(plugin.hooks).forEach((key) => {
      // hooks[key] = hooks[key].concat(plugin[key]);
      if (!hooks[key]) {
        throw new Error(`Unknown hook. "${key}"`);
      }
      hooks[key].push(plugin.hooks[key]);
    });
  });

  // Start with empty promise so that there is no immediate call and event emitter returns first
  new Promise(resolve => resolve())
    // Load files
    .then(() => events.emit('LOADING_FILES'))
    .then(() => loadTemplateFile(args.template))
    .then((newTemplateString) => { templateString = newTemplateString; })

    // Parse params
    .then(() => events.emit('PARAMETERS_PARSING'))
    .then(() => parseParameters(args.parameters))
    .then((newParamsObj) => { paramsObj = newParamsObj; })

    // Parse tags
    .then(() => events.emit('PARSING_TAGS'))
    .then(() => parseTags(args.tags))
    .then((newTagsObj) => { tagsObj = newTagsObj; })


    // Validate template
    .then(() => runPlugins(hooks.TEMPLATE_VALIDATE_PRE))
    .then(() => events.emit('VALIDATING_TEMPLATE')) // v1.x
    .then(() => events.emit('TEMPLATE_VALIDATE_PRE'))
    .then(() => validateTemplate(templateString))
    .then(() => events.emit('TEMPLATE_VALIDATE_POST'))

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
