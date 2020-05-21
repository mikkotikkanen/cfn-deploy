const mockCreateStack = require('../mocks/createStack');
const lib = require('../..');
const { readFileSync } = require('fs');



describe('cfn-deploy', () => {
  beforeAll(() => mockCreateStack.beforeAll());

  it('should successfully create new stack', (done) => {
    const events = lib({
      region: 'us-east-1',
      stackname: 'new-stack',
      templateString: readFileSync('./tests/templates/simple-template.yaml').toString(),
    });
    events.on('ERROR', (err) => done(err));
    events.on('COMPLETE', (data) => {
      expect(data).toMatchSnapshot();
    });
    events.on('FINALLY', done);
  });

  afterAll(() => mockCreateStack.afterAll());
});
