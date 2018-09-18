const AWS = require('aws-sdk-mock');
const lib = require('../');


describe('CloudFormation.validateTemplate', () => {
  beforeAll(() => {
    AWS.mock('CloudFormation', 'validateTemplate', (params, callback) => {
      callback(new Error('INVALID_TEMPLATE'));
    });
  });

  it('should error on invalid template', (done) => {
    lib({
      region: 'us-east-1',
      stackName: 'test-stack',
      template: './tests/templates/invalid-template.yaml',
    }).on('ERROR', (err) => {
      expect(err.message).toMatchSnapshot();
      done();
    });
  });

  afterAll(() => {
    AWS.restore('CloudFormation');
  });
});
