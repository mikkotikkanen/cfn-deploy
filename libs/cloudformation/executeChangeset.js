const AWS = require('aws-sdk');
const describeStack = require('./describeStack');


module.exports = (stackname, changesetName, events) => new Promise((resolve, reject) => {
  const cloudformation = new AWS.CloudFormation();
  let stackData;

  // Get the stack data
  describeStack(stackname)
    .then((newStackData) => {
      stackData = newStackData;

      const describeParams = {
        StackName: stackname,
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
        StackName: stackname,
      };
      if (stackData.StackStatus === 'REVIEW_IN_PROGRESS') {
        return cloudformation.waitFor('stackCreateComplete', waitParams).promise();
      }
      return cloudformation.waitFor('stackUpdateComplete', waitParams).promise();
    })
    .then(resolve)
    .catch(err => reject(new Error(err.message)));
});
