const AWS = require('aws-sdk');
const describeStack = require('./describeStack');


module.exports = (args, templateBody, parametersObject, events) => new Promise((resolve, reject) => { // eslint-disable-line max-len
  const cloudformation = new AWS.CloudFormation();
  let stackData;
  const changesetName = 'cfn-deploy';

  // Get the stack data
  describeStack(args.stackName)
    .then((newStackData) => {
      stackData = newStackData;
      events.emit('CREATING_CHANGESET', { type: (stackData ? 'UPDATE' : 'CREATE') });

      // Create changeset
      const createParams = {
        StackName: args.stackName,
        ChangeSetName: changesetName,
        Description: 'Created with cfn-deploy',
        Capabilities: args.capabilities,
        ChangeSetType: (stackData ? 'UPDATE' : 'CREATE'),
        TemplateBody: templateBody,
      };
      return cloudformation.createChangeSet(createParams).promise();
    })
    .then((changesetData) => {
      // Wait for the changeset to be created
      const waitParams = {
        ChangeSetName: changesetData.Id,
      };
      return cloudformation.waitFor('changeSetCreateComplete', waitParams).promise();
    })
    .then(resolve)
    .catch((err) => {
      // Get changeset data to see what went wrong
      const describeParams = {
        StackName: args.stackName,
        ChangeSetName: changesetName,
      };
      cloudformation.describeChangeSet(describeParams).promise()
        .then((changesetData) => {
          // If the changeset itself failed, reject with statusreason
          if (changesetData.Status === 'FAILED') {
            reject(new Error(changesetData.StatusReason));
          } else {
            reject(new Error(err.message));
          }
        })
        .catch(() => reject(new Error(err.message)));
    })
    .catch(err => reject(new Error(err.message)));
});
