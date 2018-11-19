const AWS = require('aws-sdk');
const describeStack = require('./describeStack');


module.exports = (stackname, changesetName) => new Promise((resolve, reject) => {
  const cloudformation = new AWS.CloudFormation();

  // Make sure stack exists
  describeStack(stackname)
    .then((stackData) => {
      if (stackData) {
        // Make sure the changeset exists
        const describeParams = {
          StackName: stackname,
          ChangeSetName: changesetName,
        };
        cloudformation.describeChangeSet(describeParams).promise()
          .then((changesetData) => {
            const deleteParams = {
              ChangeSetName: changesetData.ChangeSetId,
            };
            return cloudformation.deleteChangeSet(deleteParams).promise()
              .then(resolve)
              .catch(() => reject(new Error('Failed to delete the changeset.')));
          })
          .catch((err) => {
            // If no such changeset exists, resolve
            if (err.message === `ChangeSet [${changesetName}] does not exist`) {
              return resolve();
            }

            return reject(new Error(err.message));
          });
      } else {
        resolve();
      }
    })
    .catch(err => reject(new Error(err.message)));
});
