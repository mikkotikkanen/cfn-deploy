# cfn-deploy

Simple utility for AWS CloudFormation deployments


# Motivation
- serverless framework seems like overkill just for CloudFormation deployments
- Modules like aws-cfm-utils do weird stuff like ASG toggling which is not kosher
- `aws-cli cloudformation deploy` doesn't allow passing CloudFormation parameter files
- Need for programmatic use in other modules
- Need for usage in `package.json` scripts


## Configuring

When accessing CloudFormation, `cfn-deploy` will by default use any locally pre-configured AWS
account. You can pre-configure your account by any of the following methods:

- With [aws-cli](https://aws.amazon.com/cli/), by running `aws-cli configure` (Recommended for
local usecases)
- Set `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` and `AWS_REGION` environment variables
(Recommended for shared usecases)
- Directly configure to  `.aws\config` and `.aws\credentials` files

Additionally, you can define your AWS access and secret keys as parameters, but this is not
recommended as they A) can end to version control or B) will stay readable in logs.


## Command line use

Install as command line utility:

```bash
npm install cfn-deploy -g
```

```bash
cfn-deploy --stack-name=fancy-stack --template=cfn/cfn-stack.yaml
```

### Available options

```
Options:
  --stack-name  The name associated with the stack
  --template    Path or url to template file
  --region      AWS region
  --profile     Load profile from shared credentials file
  --access-key  AWS Access Key
  --secret-key  AWS Secret Access Key
  --version     Show version number
  --help        Show help
```



## Package.json script use

Install as dev dependency:

```bash
npm install cfn-deploy --save-dev
```

Add deploy script to `package.json`:

```json
{
  "scripts": {
    "deploy": "cfn-deploy --stack-name=fancy-stack --template=cfn/cfn-stack.yaml"
  }
}
```


## Programmatic use

For programmatic use, `cfn-deploy` returns event stream on initialization, which allows for complete
customization, even down to logging.

Install as dependency:

```bash
npm install cfn-deploy
```

Write your thing:

```javascript
const cfnDeploy = require('cfn-deploy');

const eventStream = cfnDeploy({
  stackName: 'fancy-stack',
  template: 'cfn/cfn-stack.yaml',
});

const eventStream.on('EXECUTING_CHANGESET', () => {
  console.log('Doing the thing...');
});
const eventStream.on('COMPLETE', () => {
  console.log('The thing is complete.');
});
const eventStream.on('ERROR', (err) => {
  console.log('Aw. Dang. The thing errored.', err.message);
});
```

### Available events

| Event                  | When it fires                                |
| ---------------------- | -------------------------------------------- |
| LOADING_FILES          | Template & parameters files are being loaded |
| VALIDATING_TEMPLATE    | Template is being validated                  |
| VALIDATING_STACKSTATE  | Stack state is being validated               |
| CREATING_CHANGESET     | Changeset is being created                   |
| EXECUTING_CHANGESET    | Changeset is being executed                  |
| COMPLETE               | Deployment is complete                       |
| ERROR                  | Deployment errored                           |
