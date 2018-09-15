const describeStack = require('./describeStack');

module.exports = (stackName, events) => {
  events.emit('VALIDATING_STACKSTATE');

  return describeStack(stackName)
    .then((stackData) => {
      // Only COMPLETE state stack can be updated
      if (stackData && !/_COMPLETE$/.test(stackData.StackStatus)) {
        throw new Error(`Can't update stack when status is "${stackData.StackStatus}"`);
      }
    });
};
