const fs = require('fs');


module.exports = templatePath => new Promise((resolve) => { // eslint-disable-line max-len
  const fileContents = fs.readFileSync(templatePath, { encoding: 'utf-8' });
  resolve(fileContents);
});
