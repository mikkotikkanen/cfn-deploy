const AWS = require('aws-sdk-mock');


module.exports.beforeAll = () => {
  AWS.mock('CloudFormation', 'validateTemplate', (params, callback) => {
    callback(null, {});
  });
  AWS.mock('CloudFormation', 'describeStacks', (params, callback) => {
    callback(null, {
      Stacks: [
        {
          StackStatus: 'UPDATE_COMPLETE',
        },
      ],
    });
  });
  AWS.mock('CloudFormation', 'createChangeSet', (params, callback) => {
    expect(params).toMatchSnapshot();
    callback(null, {
      Id: 'fake-changeset-id',
    });
  });
  AWS.mock('CloudFormation', 'describeChangeSet', (params, callback) => {
    callback(null, {
      ChangeSetId: 'fake-changeset-id',
    });
  });
  AWS.mock('CloudFormation', 'executeChangeSet', (params, callback) => {
    callback();
  });
  AWS.mock('CloudFormation', 'deleteChangeSet', (params, callback) => {
    callback();
  });
  AWS.mock('CloudFormation', 'waitFor', (event, params, callback) => {
    if (event === 'changeSetCreateComplete') {
      callback(null, {
        ChangeSetId: 'fake-changeset-id',
      });
    } else if (event === 'stackUpdateComplete') {
      callback(null, {
        Stacks: [
          {
            StackStatus: 'UPDATE_COMPLETE',
          },
        ],
      });
    }
  });
};

module.exports.afterAll = () => {
  AWS.restore('CloudFormation');
};
