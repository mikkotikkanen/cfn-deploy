const AWS = require('aws-sdk');

const cloudformation = new AWS.CloudFormation({
  region: 'eu-west-1',
});


module.exports = stackName => new Promise((resolve, reject) => {
  const params = {
    StackName: stackName,
  };
  cloudformation.describeStacks(params, (err, stacksData) => {
    // It's ok if stack doesn't exist, reject everything else
    if (err && err.message !== `Stack with id ${stackName} does not exist`) {
      return reject(new Error(err.message));
    }

    let stackData = null;
    if (stacksData) {
      [stackData] = stacksData.Stacks;
    }

    return resolve(stackData);
  });
});
