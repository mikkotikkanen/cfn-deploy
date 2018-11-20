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


## Migrating from 0.x to 1.x

- Dashed parameters are now undashed in order to keep the same formatting in API use (`stack-name`
-> `stackname`)
- `tags` and `parameters` in API use are now required to be an array


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
cfn-deploy --stackname=fancy-stack --template=./cfn/cfn-stack.yaml
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
    "deploy": "cfn-deploy --stackname=fancy-stack --template=./cfn/cfn-stack.yaml"
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
  stackname: 'fancy-stack',
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
| FINALLY                      | All work finished (error or success)           |



# Options

Command line and package.json options are same, API configuration uses camelCase for options.

## stackname

The name associated with the stack

## template

Path to template file

## parameters

Parameters to pass for the CloudFormation template. You can pass multiple parameters of tags, which
are combined in the order they are defined, with values from latter sets overwriting the previous.


Valid values:

- Path to .json file
- String (`ParameterKey=FirstParam,ParameterValue=first-param-value ParameterKey=SecondParam,ParameterValue=second-param-value`)
- JavaScript object (API only)

### Multiple parameter sets

```bash
cfn-deploy --stackname=fancy-stack --template=./cfn/cfn-stack.yaml --parameters=./cfn/params1.json --parameters=./cfn/params2.json
```

```javascript
parameters: [ // API requires parameters to be an array
  {
    "FirstParam": "first-param-value",
    "SecondParam": "second-param-value",
  },
  './cfn/params1.json'
],
```

### Valid .json files:

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

### Plain JavaScript object through API

```javascript
parameters: [ // API requires parameters to be an array
  {
    FirstParam: 'first-param-value',
    SecondParam: 'second-param-value',
  }
],
```

## tags

Tags to pass for the CloudFormation stack. These will also be passed to any resource that supports
tagging. You can pass multiple sets of tags, which are combined in the order they are defined, with
values from latter sets overwriting the previous.

Valid values:

- Path to .json file
- String (`Key=FirstTag,Value=first-tag-value Key=SecondTag,Value=second-tag-value`)
- JavaScript object (API only)

### Multiple tag sets

```bash
cfn-deploy --stackname=fancy-stack --template=./cfn/cfn-stack.yaml --tags=./cfn/tags1.json --tags=./cfn/tags2.json
```

```javascript
tags: [ // API requires tags to be an array
  {
    FirstTag: 'first-tag-value',
    SecondTag: 'second-tag-value',
  },
  './cfn/tags1.json'
],
```

### Valid .json files:

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

- AWS CodePipeline parameters type JSON file:

```json
{
  "Tags": {
    "FirstTag": "first-tag-value",
    "SecondTag": "second-tag-value"
  }
}
```

- Plain JSON object file

```json
{
  "FirstTag": "first-tag-value",
  "SecondTag": "second-tag-value"
}
```

### Plain JavaScript object through API

```javascript
tags: [ // API requires tags to be an array
  {
    FirstTag: 'first-tag-value',
    SecondTag: 'second-tag-value',
  }
],
```

## region

AWS region

## capabilities

AWS IAM capabilities

Valid values:

- CAPABILITY_IAM
- CAPABILITY_NAMED_IAM

## profile

Load profile from shared credentials file (in `.aws\credentials`)

## accesskey

AWS Access Key.

## secretkey

AWS Secret Access Key

## version

Show version number

__Note:__ Only for command line or package.json script use

## help

Show help

__Note:__ Only for command line or package.json script use
