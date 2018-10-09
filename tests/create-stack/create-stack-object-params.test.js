const AWS = require('aws-sdk-mock');
const lib = require('../..');


describe('cfn-deploy', () => {
  beforeAll(() => {
    let isChangeSetCreated = false;

    AWS.mock('CloudFormation', 'validateTemplate', (params, callback) => {
      callback(null, {});
    });
    AWS.mock('CloudFormation', 'describeStacks', (params, callback) => {
      if (!isChangeSetCreated) {
        callback();
      } else {
        // Stack exists once changeset has been created
        callback(null, {
          Stacks: [
            {
              StackStatus: 'REVIEW_IN_PROGRESS',
            },
          ],
        });
      }
    });
    AWS.mock('CloudFormation', 'createChangeSet', (params, callback) => {
      expect(params).toMatchSnapshot();
      isChangeSetCreated = true;
      callback(null, {
        Id: 'fake-changeset-id',
      });
    });
    AWS.mock('CloudFormation', 'describeChangeSet', (params, callback) => {
      callback(null, {
        ChangeSetId: 'fake-changeset-id',
      });
    });
    AWS.mock('CloudFormation', 'executeChangeSet', (params, callback) => {
      callback();
    });
    AWS.mock('CloudFormation', 'deleteChangeSet', (params, callback) => {
      callback(new Error('SHOULD_NOT_BE_CALLED'));
    });
    AWS.mock('CloudFormation', 'waitFor', (event, params, callback) => {
      if (event === 'changeSetCreateComplete') {
        callback(null, {
          ChangeSetId: 'fake-changeset-id',
        });
      } else if (event === 'stackCreateComplete') {
        callback(null, {
          Stacks: [
            {
              StackStatus: 'CREATE_COMPLETE',
            },
          ],
        });
      }
    });
  });

  it('should successfully create new stack', (done) => {
    const events = lib({
      region: 'us-east-1',
      stackName: 'new-stack',
      template: './tests/templates/params-template.yaml',
      parameters: {
        S3BucketName: 'from-object-params',
        DummyParam: 'dummy-param',
        OverwritableParam: 'from-object-params',
        ParamSource: 'plain-object',
      },
    });
    events.on('ERROR', err => done(err));
    events.on('COMPLETE', (data) => {
      expect(data).toMatchSnapshot();
    });
    events.on('FINALLY', done);
  });

  afterAll(() => {
    AWS.restore('CloudFormation');
  });
});
