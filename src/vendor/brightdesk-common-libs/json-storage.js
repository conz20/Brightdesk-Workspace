(function attachBrightdeskCommonLibs(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module !== null && module.exports) module.exports = api;
  if (root && typeof root.document === 'object') root.BrightdeskCommonLibs = Object.freeze(api);
})(typeof globalThis === 'object' ? globalThis : this, function buildJsonStorageApi() {
  'use strict';
  function requireStorageMethod(storage, method) {
    if (!storage || typeof storage[method] !== 'function') throw new TypeError('A storage object with ' + method + '() is required.');
  }
  function requireKey(key) {
    if (typeof key !== 'string' || key.trim().length === 0) throw new TypeError('A non-empty storage key is required.');
  }
  function cloneJsonValue(value) {
    let serialized;
    try { serialized = JSON.stringify(value); }
    catch (error) { throw new TypeError('Value must be a JSON-compatible value: ' + error.message, { cause: error }); }
    if (typeof serialized !== 'string') throw new TypeError('Value must be a JSON-compatible value; it cannot serialize to undefined.');
    try { return JSON.parse(serialized); }
    catch (error) { throw new TypeError('Value must be a JSON-compatible value: ' + error.message, { cause: error }); }
  }
  function readJsonValue(storage, key, options = {}) {
    requireStorageMethod(storage, 'getItem');
    requireKey(key);
    const { fallbackKeys = [], fallbackValue = null, validate } = options;
    if (!Array.isArray(fallbackKeys) || fallbackKeys.some(item => typeof item !== 'string' || item.trim().length === 0)) {
      throw new TypeError('fallbackKeys must be an array of non-empty strings.');
    }
    if (validate !== undefined && typeof validate !== 'function') throw new TypeError('validate must be a function when supplied.');
    const orderedKeys = [...new Set([key, ...fallbackKeys])];
    let rawValue = null;
    let selectedKey = null;
    for (const candidateKey of orderedKeys) {
      const candidate = storage.getItem(candidateKey);
      if (candidate !== null && candidate !== undefined && candidate !== '') {
        rawValue = candidate;
        selectedKey = candidateKey;
        break;
      }
    }
    if (selectedKey === null) return cloneJsonValue(fallbackValue);
    let parsed;
    try { parsed = JSON.parse(rawValue); }
    catch (error) { throw new SyntaxError('Invalid JSON stored under key ' + selectedKey + ': ' + error.message, { cause: error }); }
    if (validate && !validate(parsed)) return cloneJsonValue(fallbackValue);
    return parsed;
  }
  function writeJsonValue(storage, key, value) {
    requireStorageMethod(storage, 'setItem');
    requireKey(key);
    let serialized;
    try { serialized = JSON.stringify(value); }
    catch (error) { throw new TypeError('Value must be a JSON-compatible value: ' + error.message, { cause: error }); }
    if (typeof serialized !== 'string') throw new TypeError('Value must be a JSON-compatible value; it cannot serialize to undefined.');
    storage.setItem(key, serialized);
    return { key, characterCount: serialized.length };
  }
  return { cloneJsonValue, readJsonValue, writeJsonValue };
});
