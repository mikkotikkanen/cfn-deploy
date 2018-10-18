# cfn-deploy

Simple utility for AWS CloudFormation deployments

## Description

The need for this module arose from having to do direct manipulation of CloudFormation stacks
through `aws-cli` which is lacking in features (fe. not able to use params in CodePipeline format,
thus not able to deploy existing things) and any other available modules were not to satisfactory
(fe. doing ASG scale toggling while deploying etc.).

Also, there wasn't a module to satisfactory that would enable building other components that
utilize CloudFormation but would have their own purposes and identities (fe. custom loggers).
`cfn-deploy` allows you to build other modules and behaviors that do their own wonderful things
while not having to worry about deploying things properly to AWS.


## Features
- Runs all stack operations as change sets in order to avoid obvious problems in stack operations
- Automatically validates templates
- Assigns any stack tags automatically to any resource that supports tags
- Accepts multitude of parameter formats, including files in CodePipeline parameters format
- Accepts multitude of tag formats
- Fully programmable API, down to custom loggers


# Configuration

cfn-deploy will by default use any locally pre-configured AWS account. You can pre-configure your
account by any of the following methods:

- With [aws-cli](https://aws.amazon.com/cli/), by running `aws-cli configure` (Recommended for
local environments)
- Set `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_PROFILE` and `AWS_REGION` environment
variables (Recommended for server/container environments)
- Directly configure to  `.aws\config` and `.aws\credentials` files

Additionally, you can define your AWS access and secret keys as parameters, but this is not
recommended as they A) can end to version control or B) will stay readable in logs.


# Command line (cli) use

## Install

```bash
npm install cfn-deploy -g
```

## Usage

```bash
cfn-deploy --stack-name=fancy-stack --template=./cfn/cfn-stack.yaml
```

See [options](#options) for more details.



# Package.json script use

## Install

```bash
npm install cfn-deploy --save-dev
```

## Usage

Add the cli script to `package.json`:

```json
{
  "scripts": {
    "deploy": "cfn-deploy --stack-name=fancy-stack --template=./cfn/cfn-stack.yaml"
  }
}
```

Options are same as for cli.



# API use

## Install

```bash
npm install cfn-deploy
```

## Usage

For programmatic use, cfn-deploy returns event stream on initialization, which allows for complete
customization, down to event logging.

Write your application:

```javascript
const cfnDeploy = require('cfn-deploy');

const eventStream = cfnDeploy({
  stackName: 'fancy-stack',
  template: 'cfn/cfn-stack.yaml',
});

eventStream.on('EXECUTING_CHANGESET', () => {
  console.log('Doing the thing...');
});
eventStream.on('COMPLETE', () => {
  console.log('The thing is complete.');
});
eventStream.on('ERROR', (err) => {
  console.log('Aw. Dang. The thing errored.', err.message);
});
```

See [options](#options) for more details.

### Available events

| Event                        | When it fires                                  |
| ---------------------------- | ---------------------------------------------- |
| LOADING_FILES                | Template & parameters files are being loaded   |
| VALIDATING_TEMPLATE          | Template is being validated                    |
| VALIDATING_STACKSTATE        | Stack state is being validated                 |
| CREATING_CHANGESET           | Changeset is being created                     |
| EXECUTING_CHANGESET          | Changeset is being executed                    |
| COMPLETE                     | Deployment is complete                         |
| ERROR                        | Deployment errored                             |
| FINALLY                      | All work finished (errored or complete)        |



# Options

Command line and package.json options are same, API configuration uses camelCase for options.

## stack-name

The name associated with the stack

In API calls, use camelCase (`stackName`)

## template

Path to template file

## parameters

Parameters to pass for the CloudFormation template. Multiple parameters options are allowed and
values are combined in the order they are defined, with values from latter overwriting previous.

Valid values:

- Path to .json file
- String (`ParameterKey=FirstParam,ParameterValue=first-param-value ParameterKey=SecondParam,ParameterValue=second-param-value`)
- Plain JavaScript object (API only)


Valid .json files:

- `aws-cli cloudformation` type JSON file:

```json
[
  {
    "ParameterKey": "FirstParam",
    "ParameterValue": "first-param-value"
  },
  {
    "ParameterKey": "SecondParam",
    "ParameterValue": "second-param-value"
  }
]
```

- AWS CodePipeline parameters type JSON file:

```json
{
  "Parameters": {
    "FirstParam": "first-param-value",
    "SecondParam": "second-param-value"
  }
}
```

- Plain JSON object file

```json
{
  "FirstParam": "first-param-value",
  "SecondParam": "second-param-value"
}
```

- Plain JavaScript object through API

```javascript
parameters: {
  FirstParam: 'first-param-value',
  SecondParam: 'second-param-value',
},
```

__Multiple parameter options__

Pass multiple parameter options as repeated `--parameters` params

```bash
cfn-deploy --stack-name=fancy-stack --template=./cfn/cfn-stack.yaml --parameters=./cfn/params1.json --parameters=./cfn/params2.json
```

For API, you pass multiple parameter options as an array

```javascript
parameters: ['./cfn/params1.json', './cfn/params2.json'],
```

You can also mix and match different types of parameters

## tags

Tags to pass for the CloudFormation stack. These will also be passed to any resource that supports
tagging. Multiple sets of tags are allowed and are combined in the order they are defined, with
values from latter sets overwriting the previous.

Valid values:

- Path to .json file
- String (`Key=FirstTag,Value=first-tag-value Key=SecondTag,Value=second-tag-value`)
- Plain JavaScript object (API only)


Valid .json files:

- `aws-cli cloudformation` type JSON file:

```json
[
  {
    "Key": "FirstTag",
    "Value": "first-tag-value"
  },
  {
    "Key": "SecondTag",
    "Value": "second-tag-value"
  }
]
```

- Plain JSON object file

```json
{
  "FirstTag": "first-tag-value",
  "SecondTag": "second-tag-value"
}
```

- Plain JavaScript object through API

```javascript
parameters: {
  FirstTag: 'first-tag-value',
  SecondTag: 'second-tag-value',
},
```

__Multiple tag options__

Pass multiple tag options as repeated `--tags` params

```bash
cfn-deploy --stack-name=fancy-stack --template=./cfn/cfn-stack.yaml --tags=./cfn/tags1.json --tags=./cfn/tags2.json
```

For API, you pass multiple tags options as an array

```javascript
tags: ['./cfn/tags1.json', './cfn/tags2.json'],
```

You can also mix and match different types of tags

## region

AWS region

## capabilities

AWS IAM capabilities

Valid values:

- CAPABILITY_IAM
- CAPABILITY_NAMED_IAM

## profile

Load profile from shared credentials file (in `.aws\credentials`)

## access-key

AWS Access Key.

In API calls, use camelCase (`accessKey`)

## secret-key

AWS Secret Access Key

In API calls, use camelCase (`secretKey`)

## version

Show version number

__Note:__ Only for command line or package.json script use

## help

Show help

__Note:__ Only for command line or package.json script use
