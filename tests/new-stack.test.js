const AWS = require('aws-sdk-mock');
const lib = require('..');


describe('cfn-deploy', () => {
  beforeAll(() => {
    let isChangeSetCreated = false;

    AWS.mock('CloudFormation', 'validateTemplate', (params, callback) => {
      expect(params).toMatchSnapshot();
      callback(null, {});
    });
    AWS.mock('CloudFormation', 'describeStacks', (params, callback) => {
      expect(params).toMatchSnapshot();
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
      // No snapshot matching since describe is used with different params
      callback(null, {
        ChangeSetId: 'fake-changeset-id',
      });
    });
    AWS.mock('CloudFormation', 'executeChangeSet', (params, callback) => {
      expect(params).toMatchSnapshot();
      callback();
    });
    AWS.mock('CloudFormation', 'deleteChangeSet', (params, callback) => {
      callback(new Error('SHOULD_NOT_BE_CALLED'));
    });
    AWS.mock('CloudFormation', 'waitFor', (event, params, callback) => {
      if (event === 'changeSetCreateComplete') {
        expect(params).toMatchSnapshot();
        callback(null, {
          ChangeSetId: 'fake-changeset-id',
        });
      } else if (event === 'stackCreateComplete') {
        expect(params).toMatchSnapshot();
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
      template: './tests/templates/simple-s3-template.yaml',
    });
    events.on('ERROR', err => done(err));
    events.on('COMPLETE', (data) => {
      expect(data).toMatchSnapshot();
      done();
    });
  });

  afterAll(() => {
    AWS.restore('CloudFormation');
  });
});
