const CryptoJS = require('crypto-js');

const SECRET_KEY = 'ydqXY0ocnFLmJGHr_zNzFcpjwAsXq_8JcBNURAkRscg';

/**
 * Generates the X-SIGNATURE for CGV API requests.
 * The signature is created by generating an HMAC-SHA256 hash of a concatenated
 * string of timestamp, request path, and request body, and then Base64-encoding the result.
 *
 * @param {string} pathname The request path (e.g., '/common/auth/refreshtoken').
 * @param {string} body The request body. This should be an empty string ("") for requests with no body. For multipart/form-data requests, this should be the literal string "multipart/form-data".
 * @param {string} timestamp The current Unix timestamp in seconds, as a string.
 * @returns {string} The Base64-encoded HMAC-SHA256 signature.
 */
function generateCgvSignature(pathname, body, timestamp) {
  if (typeof pathname !== 'string' || typeof body !== 'string' || typeof timestamp !== 'string') {
    throw new Error('All arguments (pathname, body, timestamp) must be strings.');
  }

  const dataToSign = `${timestamp}|${pathname}|${body}`;
  const hmac = CryptoJS.HmacSHA256(dataToSign, SECRET_KEY);
  
  return CryptoJS.enc.Base64.stringify(hmac);
}

module.exports = {
  generateCgvSignature
};