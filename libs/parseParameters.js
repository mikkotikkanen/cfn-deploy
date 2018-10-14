const fs = require('fs');


/**
 * Map parameters
 *
 */
const parameterMapper = (paramSet) => {
  let paramSetNew = paramSet;

  // File path
  if (typeof paramSetNew === 'string' && paramSetNew.indexOf('ParameterKey=') === -1) {
    const paramsString = fs.readFileSync(paramSetNew, { encoding: 'utf-8' });
    try {
      paramSetNew = JSON.parse(paramsString);
    } catch (err) {
      throw Error('Invalid parameter file.');
    }
  }

  // CodePipeline Template Configuration array, normalize to plain parameters object
  // (https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/continuous-delivery-codepipeline-cfn-artifacts.html#d0e10167)
  if (!Array.isArray(paramSetNew) && typeof paramSetNew === 'object' && paramSetNew.Parameters) {
    paramSetNew = paramSetNew.Parameters;
  }


  // Parameter string ("ParameterKey=S3BucketName,ParameterValue=from-string-params")
  if (typeof paramSetNew === 'string' && paramSetNew.indexOf('ParameterKey=') !== -1) {
    return paramSetNew.split(',').reduce((obj, param) => {
      const newObj = obj;
      const paramParts = param.split('=');
      [, newObj[paramParts[0]]] = paramParts;
      return newObj;
    }, {});
  }

  // Plain JS object
  if (!Array.isArray(paramSetNew) && typeof paramSetNew === 'object') {
    return Object.keys(paramSetNew).map(key => ({
      ParameterKey: key,
      ParameterValue: paramSetNew[key],
    }));
  }

  // Already a params array
  if (Array.isArray(paramSetNew) && paramSetNew[0].ParameterKey) {
    return paramSetNew;
  }

  throw new Error(`Unspported parameter type. ${paramSetNew}`);
};


/**
 *
 * @param {Array} paramSets Parameter sets
 */
const parseParameters = paramSets => new Promise((resolve) => {
  // If no params are defined, resolve to empty array
  if (!paramSets) {
    return resolve([]);
  }

  // Make sure what we have is an array (of parameter sets)
  let paramSetsArr = paramSets;
  if (!Array.isArray(paramSetsArr)) {
    paramSetsArr = [paramSetsArr];
  }

  // Reduce arrays into object
  const paramsArr = paramSetsArr
    .map(parameterMapper)
    .reduce((arr, paramset) => [].concat(arr, paramset), []);

  return resolve(paramsArr);
});


module.exports = parseParameters;
