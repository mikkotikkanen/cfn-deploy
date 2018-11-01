const AWS = require('aws-sdk-mock');

module.exports.beforeAll = () => {
  let isChangeSetCreated = false;

  AWS.mock('CloudFormation', 'validateTemplate', (params, callback) => {
    callback(null, {});
  });
  AWS.mock('CloudFormation', 'describeStacks', (params, callback) => {
    if (!isChangeSetCreated) {
      callback();
    } else {
      // Stack exists once changeset has been created
      callback(null, {
        Stacks: [
          {
            StackStatus: 'REVIEW_IN_PROGRESS',
          },
        ],
      });
    }
  });
  AWS.mock('CloudFormation', 'createChangeSet', (params, callback) => {
    expect(params).toMatchSnapshot();
    isChangeSetCreated = true;
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
    callback(new Error('SHOULD_NOT_BE_CALLED'));
  });
  AWS.mock('CloudFormation', 'waitFor', (event, params, callback) => {
    if (event === 'changeSetCreateComplete') {
      callback(null, {
        ChangeSetId: 'fake-changeset-id',
      });
    } else if (event === 'stackCreateComplete') {
      callback(null, {
        Stacks: [
          {
            StackStatus: 'CREATE_COMPLETE',
          },
        ],
      });
    }
  });
};


module.exports.afterAll = () => {
  AWS.restore('CloudFormation');
};
