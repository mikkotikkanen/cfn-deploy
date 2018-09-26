const AWS = require('aws-sdk-mock');
const lib = require('..');


describe('cfn-deploy', () => {
  beforeAll(() => {
    AWS.mock('CloudFormation', 'validateTemplate', (params, callback) => {
      expect(params).toMatchSnapshot();
      callback(null, {});
    });
    AWS.mock('CloudFormation', 'describeStacks', (params, callback) => {
      expect(params).toMatchSnapshot();
      callback(null, {
        Stacks: [
          {
            StackStatus: 'UPDATE_COMPLETE',
          },
        ],
      });
    });
    AWS.mock('CloudFormation', 'createChangeSet', (params, callback) => {
      expect(params).toMatchSnapshot();
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
      expect(params).toMatchSnapshot();
      callback();
    });
    AWS.mock('CloudFormation', 'waitFor', (event, params, callback) => {
      if (event === 'changeSetCreateComplete') {
        expect(params).toMatchSnapshot();
        callback(null, {
          ChangeSetId: 'fake-changeset-id',
        });
      } else if (event === 'stackUpdateComplete') {
        expect(params).toMatchSnapshot();
        callback(null, {
          Stacks: [
            {
              StackStatus: 'UPDATE_COMPLETE',
            },
          ],
        });
      }
    });
  });

  it('should successfully update existing stack', (done) => {
    const events = lib({
      region: 'us-east-1',
      stackName: 'existing-stack',
      template: './tests/templates/simple-template.yaml',
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
