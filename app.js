const { t } = require('./utils/i18n');
App({
  t,
  onLaunch(options) {
    // Page opens for the first time
    console.info('App onLaunch');
  },
  onShow(options) {
    // Reopened by scheme from the background
  },
});
