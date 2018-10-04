const fs = require('fs');


/**
 * Load parameters file
 *
 * @param {string|Object} params List of parameters (path to file, string list or plain object)
 */
const parseParameters = params => new Promise((resolve, reject) => {
  let paramsObj;

  // Handle different types
  if (!Array.isArray(params) && typeof params === 'object') {
    // Parameter is plain object, pass on as is
    paramsObj = params;
  } else if (typeof params === 'string' && params.indexOf('ParameterKey=') !== -1) {
    // Parameter is "ParameterKey=S3BucketName,ParameterValue=from-string-params" string
    let key;
    let value;
    params.split(',').forEach((paramPart) => {
      if (paramPart.indexOf('ParameterKey=') !== -1) {
        key = paramPart.split('=')[1].trim();
      } else if (paramPart.indexOf('ParameterValue=') !== -1) {
        value = paramPart.split('=')[1].trim();
      }
    });

    // Set as object
    paramsObj = {};
    paramsObj[key] = value;
  } else if (typeof params === 'string' && params.indexOf('ParameterKey=') === -1) {
    // Parameter is a path, load the file and try to parse it
    const paramsString = fs.readFileSync(params, { encoding: 'utf-8' });
    try {
      paramsObj = JSON.parse(paramsString);
    } catch (err) {
      reject(new Error('Invalid parameter file.'));
    }
  }


  /**
   * Parse parameters object
   */
  // If it's already array, make sure it has correct keys
  if (Array.isArray(paramsObj) && !paramsObj[0].ParameterKey) {
    return reject(new Error('Invalid parameters array.'));
  }

  /**
   * If it's CloudFormation Template Configuration (file), standardize to plain parameters object
   *
   * https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/continuous-delivery-codepipeline-cfn-artifacts.html#d0e10167
   */
  if (!Array.isArray(paramsObj) && typeof paramsObj === 'object' && paramsObj.Parameters) {
    paramsObj = paramsObj.Parameters;
  }

  /**
   * Convert object to CloudFormation parameters array
   *
   * https://docs.aws.amazon.com/cli/latest/reference/cloudformation/create-stack.html
   */
  if (!Array.isArray(paramsObj) && typeof paramsObj === 'object') {
    paramsObj = Object.keys(paramsObj).map(key => ({
      ParameterKey: key,
      ParameterValue: paramsObj[key],
    }));
  }

  return resolve(paramsObj);
});


module.exports = paramSets => new Promise((resolve, reject) => { // eslint-disable-line max-len
  // If no params are defined, resolve to empty array
  if (!paramSets) {
    return resolve([]);
  }

  // Make sure what we have is an array (of parameter sets)
  let paramSetsArr = paramSets;
  if (!Array.isArray(paramSetsArr)) {
    paramSetsArr = [paramSetsArr];
  }

  // Handle all parameters
  return Promise
    .all(paramSetsArr.map(filepath => parseParameters(filepath)))
    .then((paramArrays) => {
      // Combine all parameter arrays to one
      let paramsArr = [];
      paramArrays.forEach((arr) => {
        paramsArr = paramsArr.concat(arr);
      });
      return paramsArr;
    })
    .then(resolve)
    .catch(reject);
});
