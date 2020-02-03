const AWS = require('aws-sdk');
const describeStack = require('./describeStack');


module.exports = (args, templateBody, paramsObj, tagsObj) => new Promise((resolve, reject) => { // eslint-disable-line max-len
  const cloudformation = new AWS.CloudFormation();
  let stackData;
  const changesetName = 'cfn-deploy';

  // Get the stack data
  describeStack(args.stackname)
    .then((newStackData) => {
      stackData = newStackData;

      // Create changeset
      const createParams = {
        StackName: args.stackname,
        ChangeSetName: changesetName,
        Description: 'Created with cfn-deploy',
        Capabilities: (args.capabilities ? [args.capabilities] : []),
        ChangeSetType: (stackData ? 'UPDATE' : 'CREATE'),
        Parameters: paramsObj,
        Tags: tagsObj,
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
        StackName: args.stackname,
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
    .catch((err) => reject(new Error(err.message)));
});
