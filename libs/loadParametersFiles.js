const fs = require('fs');


/**
 * Load parameters file
 *
 * @param {string} filepath File path to parameters file
 */
const loadParametersFile = filepath => new Promise((resolve, reject) => {
  // Load file
  const paramsString = fs.readFileSync(filepath, { encoding: 'utf-8' });

  // Parse file
  let params;
  try {
    params = JSON.parse(paramsString);
  } catch (err) {
    reject(new Error('Invalid parameter file.'));
  }

  // If it's already array, make sure valid
  if (Array.isArray(params) && (!params[0].ParameterKey || !params[0].ParameterValue)) {
    return reject(new Error('Invalid parameters array.'));
  }

  // Standardize CodePipeline Parameter object to plain object
  if (!Array.isArray(params) && typeof params === 'object' && params.Parameters) {
    params = params.Parameters;
  }

  // If it's object, convert to array
  if (!Array.isArray(params) && typeof params === 'object') {
    params = Object.keys(params).map(key => ({
      ParameterKey: key,
      ParameterValue: params[key],
    }));
  }

  return resolve(params);
});


module.exports = (filepaths, events) => new Promise((resolve, reject) => { // eslint-disable-line max-len
  events.emit('LOADING_PARAMETERS');

  // If no path is defined, just return empty object
  if (!filepaths) {
    return resolve([]);
  }

  // Make sure it's array
  let filepathsArr = filepaths;
  if (!Array.isArray(filepathsArr)) {
    filepathsArr = [filepathsArr];
  }

  // Handle all filepaths
  return Promise
    .all(filepathsArr.map(filepath => loadParametersFile(filepath)))
    .then((paramsArr) => {
      // Combine all parameter arrays to one
      let allParams = [];
      paramsArr.forEach((arr) => {
        allParams = allParams.concat(arr);
      });
      return allParams;
    })
    .then(resolve)
    .catch(reject);
});
