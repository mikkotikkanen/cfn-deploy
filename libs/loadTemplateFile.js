const fs = require('fs');
const isUrl = require('is-url');


module.exports = (templatePath, parametersPath, events) => new Promise((resolve, reject) => { // eslint-disable-line max-len
  events.emit('LOADING_FILES');

  // Load template
  if (isUrl(templatePath)) {
    reject(new Error('Template url not supported.'));
  } else {
    const fileContents = fs.readFileSync(templatePath, { encoding: 'utf-8' });
    resolve(fileContents);
  }

  // Load parameters
  if (parametersPath) {
    reject(new Error('Parameters are not supported yet.'));
  }
});
