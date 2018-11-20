const AWS = require('aws-sdk-mock');
const lib = require('../');


describe('CloudFormation.validateTemplate', () => {
  beforeAll(() => {
    AWS.mock('CloudFormation', 'validateTemplate', (params, callback) => {
      callback(new Error('INVALID_TEMPLATE'));
    });
  });

  it('should error on invalid template', (done) => {
    const events = lib({
      region: 'us-east-1',
      stackname: 'test-stack',
      template: './tests/templates/invalid-template.yaml',
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
