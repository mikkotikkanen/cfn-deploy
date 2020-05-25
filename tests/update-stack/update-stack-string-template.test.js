const { readFileSync } = require('fs');
const mockCreateStack = require('../mocks/updateStack');
const lib = require('../..');

describe('cfn-deploy', () => {
  beforeAll(() => mockCreateStack.beforeAll());

  it('should successfully create new stack', (done) => {
    const events = lib({
      region: 'us-east-1',
      stackname: 'existing-stack',
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
