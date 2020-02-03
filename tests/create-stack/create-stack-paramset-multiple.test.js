const mockCreateStack = require('../mocks/createStack');
const lib = require('../..');
const stringParams = require('../params/string-params.json');


describe('cfn-deploy', () => {
  beforeAll(() => mockCreateStack.beforeAll());

  it('should successfully create new stack', (done) => {
    let paramsArray = [
      './tests/params/array-params.json',
      './tests/params/object-cp-params.json',
      './tests/params/object-params.json',
      {
        S3BucketName: 'from-object-params',
        DummyParam: 'dummy-param',
        OverwritableParam: 'from-object-params',
        ParamSource: 'plain-object',
      },
    ];
    paramsArray = paramsArray.concat(stringParams);
    const events = lib({
      region: 'us-east-1',
      stackname: 'new-stack',
      template: './tests/templates/params-template.yaml',
      parameters: paramsArray,
    });
    events.on('ERROR', (err) => done(err));
    events.on('COMPLETE', (data) => {
      expect(data).toMatchSnapshot();
    });
    events.on('FINALLY', done);
  });

  afterAll(() => mockCreateStack.afterAll());
});
