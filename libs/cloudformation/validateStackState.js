const describeStack = require('./describeStack');

module.exports = (stackname, events) => {
  events.emit('VALIDATING_STACKSTATE');

  return describeStack(stackname)
    .then((stackData) => {
      // Only COMPLETE state stack can be updated
      if (stackData && !/_COMPLETE$/.test(stackData.StackStatus)) {
        throw new Error(`Can't update stack when status is "${stackData.StackStatus}"`);
      }
    });
};
