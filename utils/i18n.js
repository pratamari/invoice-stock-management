// utils/i18n.js
const en = require('../i18n/en.json');
const id = require('../i18n/id.json');

function getLocale() {
  const lang = my.getSystemInfoSync().language;
  if (lang.startsWith('id')) return 'id';
  return 'en';
}

function t(key) {
  const locale = getLocale();
  if (locale === 'id') {
    return id[key] || en[key] || key;
  }
  return en[key] || key;
}

module.exports = { t, getLocale };
