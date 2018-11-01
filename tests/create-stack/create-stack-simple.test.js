const mockCreateStack = require('../mocks/createStack');
const lib = require('../..');


describe('cfn-deploy', () => {
  beforeAll(() => mockCreateStack.beforeAll());

  it('should successfully create new stack', (done) => {
    const events = lib({
      region: 'us-east-1',
      stackName: 'new-stack',
      template: './tests/templates/simple-template.yaml',
    });
    events.on('ERROR', err => done(err));
    events.on('COMPLETE', (data) => {
      expect(data).toMatchSnapshot();
    });
    events.on('FINALLY', done);
  });

  afterAll(() => mockCreateStack.afterAll());
});
