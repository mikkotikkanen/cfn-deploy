const fs = require('fs');


module.exports = (templatePath, events) => new Promise((resolve) => { // eslint-disable-line max-len
  events.emit('LOADING_FILES'); // Retain old event
  events.emit('LOADING_TEMPLATE');

  const fileContents = fs.readFileSync(templatePath, { encoding: 'utf-8' });
  resolve(fileContents);
});
