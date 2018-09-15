# cfn-deploy

Simple utility for AWS CloudFormation deployments


# Motivation
- serverless framework seems like overkill just for CloudFormation deployments
- Modules like aws-cfm-utils do weird stuff like ASG toggling which is not kosher
- `aws-cli cloudformation deploy` doesn't allow passing CloudFormation parameter files
- Need for programmatic use in other modules
- Need for usage in `package.json` scripts


# Getting Started

As command line utility

```bash
npm install cfn-deploy -g
```

Or for npm scripts or programmatic use

```bash
npm install cfn-deploy --save-dev
```


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


## CLI Options

```
Options:
  --stack-name  The name associated with the stack                    [required]
  --template    Path or url to template file                          [required]
  --region      AWS region                                [default: "us-east-1"]
  --access-key  AWS Access Key
  --secret-key  AWS Secret Access Key
  --version     Show version number
  --help        Show help
```

# Things to do (not yet implemented)

- Url as template path
- --parameters option
- --profile option
- --capabilities option
- --tags option
