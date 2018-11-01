const mockCreateStack = require('../mocks/createStack');
const lib = require('../..');
const stringTags = require('../tags/string-tags.json');


describe('cfn-deploy', () => {
  beforeAll(() => mockCreateStack.beforeAll());

  it('should successfully create new stack', (done) => {
    let tagsArray = [
      './tests/tags/array-tags.json',
      './tests/tags/object-tags.json',
      {
        DummyTag: 'dummy-tag',
        OverwritableTag: 'from-object-tags',
        TagSource: 'plain-object',
      },
    ];
    tagsArray = tagsArray.concat(stringTags);
    const events = lib({
      region: 'us-east-1',
      stackName: 'new-stack',
      template: './tests/templates/simple-template.yaml',
      tags: tagsArray,
    });
    events.on('ERROR', err => done(err));
    events.on('COMPLETE', (data) => {
      expect(data).toMatchSnapshot();
    });
    events.on('FINALLY', done);
  });

  afterAll(() => mockCreateStack.afterAll());
});
