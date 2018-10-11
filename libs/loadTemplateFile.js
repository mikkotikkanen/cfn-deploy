const fs = require('fs');


module.exports = (templatePath = '') => new Promise((resolve) => {
  const fileContents = fs.readFileSync(templatePath, { encoding: 'utf-8' });
  resolve(fileContents);
});
