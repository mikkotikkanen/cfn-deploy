const lib = require('../');


describe('CloudFormation.validateTemplate', () => {
  it('should error on non-existent template', (done) => {
    const events = lib({
      region: 'us-east-1',
      stackname: 'test-stack',
      template: './tests/templates/non-existent-template.yaml',
    });
    events.on('ERROR', (err) => {
      expect(err.message).toMatchSnapshot();
      done();
    });
  });
});
