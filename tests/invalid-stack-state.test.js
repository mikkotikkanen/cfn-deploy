const AWS = require('aws-sdk-mock');
const lib = require('..');


describe('CloudFormation.validateTemplate', () => {
  beforeAll(() => {
    AWS.mock('CloudFormation', 'validateTemplate', (params, callback) => {
      callback(null, true);
    });
    AWS.mock('CloudFormation', 'describeStacks', (params, callback) => {
      callback(null, {
        Stacks: [
          {
            StackStatus: 'UPDATE_IN_PROGRESS',
          },
        ],
      });
    });
    // AWS.mock('CloudFormation', 'createChangeSet', (params, callback) => {
    //   callback(new Error('INVALID_TEMPLATE'));
    // });
    // AWS.mock('CloudFormation', 'describeChangeSet', (params, callback) => {
    //   callback(new Error('INVALID_TEMPLATE'));
    // });
    // AWS.mock('CloudFormation', 'executeChangeSet', (params, callback) => {
    //   callback(new Error('INVALID_TEMPLATE'));
    // });
    // AWS.mock('CloudFormation', 'deleteChangeSet', (params, callback) => {
    //   callback(new Error('INVALID_TEMPLATE'));
    // });
    // AWS.mock('CloudFormation', 'waitFor', (params, callback) => {
    //   callback(new Error('INVALID_TEMPLATE'));
    // });
  });

  it('should error on invalid stack state', (done) => {
    lib({
      region: 'us-east-1',
      stackName: 'test-stack',
      template: './tests/templates/simple-s3-template.yaml',
    }).on('ERROR', (err) => {
      expect(err.message).toMatchSnapshot();
      done();
    });
  });

  afterAll(() => {
    AWS.restore('CloudFormation');
  });
});
