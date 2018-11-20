const fs = require('fs');


/**
 * Map tags
 *
 */
const tagMapper = (tagSet) => {
  let tagSetNew = tagSet;

  // File path
  if (typeof tagSetNew === 'string' && tagSetNew.indexOf('Key=') === -1) {
    const tagsString = fs.readFileSync(tagSetNew, { encoding: 'utf-8' });
    try {
      tagSetNew = JSON.parse(tagsString);
    } catch (err) {
      throw Error('Invalid tags file.');
    }
  }


  // Tag string ("Key=TagSource,Value=object-tags.json")
  if (typeof tagSetNew === 'string' && tagSetNew.indexOf('Key=') !== -1) {
    return tagSetNew.split(',').reduce((obj, tags) => {
      const newObj = obj;
      const parts = tags.split('=');
      [, newObj[parts[0]]] = parts;
      return newObj;
    }, {});
  }

  // CodePipeline Template Configuration array, normalize to plain tags object
  // (https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/continuous-delivery-codepipeline-cfn-artifacts.html#d0e10167)
  if (!Array.isArray(tagSetNew) && typeof tagSetNew === 'object' && tagSetNew.Tags) {
    tagSetNew = tagSetNew.Tags;
  }

  // Plain JS object
  if (!Array.isArray(tagSetNew) && typeof tagSetNew === 'object') {
    return Object.keys(tagSetNew).map(key => ({
      Key: key,
      Value: tagSetNew[key],
    }));
  }

  // Already an array
  if (Array.isArray(tagSetNew) && tagSetNew[0].Key) {
    return tagSetNew;
  }

  throw new Error(`Unspported tags type. ${tagSetNew}`);
};


/**
 *
 * @param {Array} tagSets Tag sets
 */
const parseTags = tagSets => new Promise((resolve) => {
  // If no tags are defined, resolve to empty array
  if (!tagSets) {
    return resolve([]);
  }

  // Reduce arrays into object
  const tagsArr = tagSets
    .map(tagMapper)
    .reduce((arr, tagset) => [].concat(arr, tagset), []);

  return resolve(tagsArr);
});


module.exports = parseTags;
