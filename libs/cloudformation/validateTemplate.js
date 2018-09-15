const AWS = require('aws-sdk');


module.exports = (templateBody, events) => new Promise((resolve, reject) => {
  const cloudformation = new AWS.CloudFormation();
  events.emit('VALIDATING_TEMPLATE');

  const params = {
    TemplateBody: templateBody,
  };
  return cloudformation.validateTemplate(params).promise()
    .then(resolve)
    .catch(err => reject(new Error(err.message)));
});
