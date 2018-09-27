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
  });

  it('should error on invalid stack state', (done) => {
    const events = lib({
      region: 'us-east-1',
      stackName: 'test-stack',
      template: './tests/templates/simple-template.yaml',
    });
    events.on('ERROR', (err) => {
      expect(err.message).toMatchSnapshot();
      done();
    });
  });

  afterAll(() => {
    AWS.restore('CloudFormation');
  });
});
