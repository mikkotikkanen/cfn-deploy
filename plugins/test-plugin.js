module.exports = {
  /**
   * Events will be fired as "PLUGIN-<plugin-name>-<event-name>"
   */
  messages: {
    EXECUTING: () => 'Running plugin...',
    EXECUTED: () => 'Plugin done',
  },
  hooks: {
    TEMPLATE_VALIDATE_PRE: (events, data) => new Promise((resolve) => {
      events.emit('EXECUTING');
      console.log(data);
      setTimeout(() => {
        events.emit('EXECUTED');
        resolve();
      }, 1 * 1000);
    }),
  },
};
