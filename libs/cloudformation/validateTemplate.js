const AWS = require('aws-sdk');


module.exports = templateBody => new Promise((resolve, reject) => {
  const cloudformation = new AWS.CloudFormation();

  const params = {
    TemplateBody: templateBody,
  };
  return cloudformation.validateTemplate(params).promise()
    .then(resolve)
    .catch(err => reject(new Error(err.message)));
});
