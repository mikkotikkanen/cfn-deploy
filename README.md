# cfn-deploy

Simple utility for CloudFormation deployments

Features and documentation still very much work in progress.

# Motivation
- serverless framework seems like overkill just for CloudFormation deployments
- Modules like aws-cfm-utils do weird stuff like ASG toggling which is not kosher
- `aws-cli cloudformation deploy` doesn't allow passing CloudFormation parameter files
- Need for programmatic use in other modules
- Need for usage in `package.json` scripts


# Usage

As command line utility

```bash
npm install cfn-deploy -g
```

Or for npm scripts or programmatic use

```bash
npm install cfn-deploy --save-dev
```


## Options
- --stack-name (Set stack name)
- --template (Path to CloudFormation template)
- --region (AWS region, defaults to us-east-1)


# Things to do (not yet implemented)

- Url as template path
- --parameters option
- --region option
- --profile option
- --accesskey option
- --secretkey option
- --capabilities option
- --tags option
