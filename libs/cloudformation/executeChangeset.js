const AWS = require('aws-sdk');
const describeStack = require('./describeStack');

const cloudformation = new AWS.CloudFormation({
  region: 'eu-west-1',
});


module.exports = (stackName, changesetName, events) => new Promise((resolve, reject) => { // eslint-disable-line max-len
  let stackData;

  // Get the stack data
  describeStack(stackName)
    .then((newStackData) => {
      stackData = newStackData;

      const describeParams = {
        StackName: stackName,
        ChangeSetName: changesetName,
      };
      return cloudformation.describeChangeSet(describeParams).promise();
    })
    .then((changesetData) => {
      // Execute changeset
      const executeParams = {
        ChangeSetName: changesetData.ChangeSetId,
      };
      return cloudformation.executeChangeSet(executeParams).promise();
    })
    .then(() => {
      events.emit('EXECUTING_CHANGESET', { type: (stackData ? 'UPDATE' : 'CREATE') });

      // Wait for the stack create/update
      const waitParams = {
        StackName: stackName,
      };
      const waitForState = (stackData.StackStatus === 'REVIEW_IN_PROGRESS' ? 'stackCreateComplete' : 'stackUpdateComplete');
      return cloudformation.waitFor(waitForState, waitParams).promise();
    })
    .then(resolve)
    .catch(err => reject(new Error(err.message)));
});
