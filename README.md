# cfn-deploy


# Motivation
- serverless seems overkill just for CloudFormatoin deployments
- modules like aws-cfm-utils do weird stuff like ASG toggling
- `aws-cli cloudformation deploy` doesn't allow passing parameter files
- Other options have no proper no programmatic use


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
--stack-name
--template

__Not yet implemented__
--parameters
--region
--profile
--accesskey
--secretkey
--capabilities
--tags
