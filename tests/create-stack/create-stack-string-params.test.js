const mockCreateStack = require('../mocks/createStack');
const lib = require('../..');
const stringParams = require('../params/string-params.json');


describe('cfn-deploy', () => {
  beforeAll(() => mockCreateStack.beforeAll());

  it('should successfully create new stack', (done) => {
    const events = lib({
      region: 'us-east-1',
      stackname: 'new-stack',
      template: './tests/templates/params-template.yaml',
      parameters: stringParams,
    });
    events.on('ERROR', err => done(err));
    events.on('COMPLETE', (data) => {
      expect(data).toMatchSnapshot();
    });
    events.on('FINALLY', done);
  });

  afterAll(() => mockCreateStack.afterAll());
});
