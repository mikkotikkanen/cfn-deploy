const mockCreateStack = require('../mocks/updateStack');
const lib = require('../..');
const stringTags = require('../tags/string-tags.json');


describe('cfn-deploy', () => {
  beforeAll(() => mockCreateStack.beforeAll());

  it('should successfully update existing stack', (done) => {
    let tagsArray = [
      './tests/tags/array-tags.json',
      './tests/tags/object-tags.json',
      './tests/tags/object-cp-tags.json',
      {
        DummyTag: 'dummy-tag',
        OverwritableTag: 'from-object-tags',
        TagSource: 'plain-object',
      },
    ];
    tagsArray = tagsArray.concat(stringTags);
    const events = lib({
      region: 'us-east-1',
      stackName: 'existing-stack',
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
