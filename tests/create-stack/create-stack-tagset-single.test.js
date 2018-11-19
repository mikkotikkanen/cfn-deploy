const mockCreateStack = require('../mocks/createStack');
const lib = require('../..');


describe('cfn-deploy', () => {
  beforeAll(() => mockCreateStack.beforeAll());

  it('should successfully create new stack', (done) => {
    const events = lib({
      region: 'us-east-1',
      stackname: 'new-stack',
      template: './tests/templates/simple-template.yaml',
      tags: './tests/tags/object-tags.json',
    });
    events.on('ERROR', err => done(err));
    events.on('COMPLETE', (data) => {
      expect(data).toMatchSnapshot();
    });
    events.on('FINALLY', done);
  });

  afterAll(() => mockCreateStack.afterAll());
});
