const AWS = require('aws-sdk');

const cloudformation = new AWS.CloudFormation({
  region: 'eu-west-1',
});


module.exports = (templateBody, events) => {
  events.emit('VALIDATING_TEMPLATE');

  const params = {
    TemplateBody: templateBody,
  };
  return cloudformation.validateTemplate(params).promise();
};
