const lib = require('../');


describe('CloudFormation.validateTemplate', () => {
  it('should error on non-existent template', (done) => {
    lib({
      region: 'us-east-1',
      stackName: 'test-stack',
      template: './tests/templates/non-existent-template.yaml',
    }).on('ERROR', (err) => {
      expect(err.message).toMatchSnapshot();
      done();
    });
  });
});
