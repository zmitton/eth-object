const keccak256 = require('js-sha3').keccak256;
const BN = require('bn.js');
const Buffer = require('safe-buffer').Buffer;


// following 5 functions adapted or copied from ethereumjs-util

exports.keccak = function (a) {
  a = exports.toBuffer(a);
  return keccak256.create().update(a).digest();
};

exports.toBuffer = function (v) {
  if (!Buffer.isBuffer(v)) {
      if (Array.isArray(v)) {
          v = Buffer.from(v);
      }
      else if (typeof v === 'string') {
          if (isHexString(v)) {
              v = Buffer.from(padToEven(stripHexPrefix(v)), 'hex');
          }
          else {
              v = Buffer.from(v);
          }
      }
      else if (typeof v === 'number') {
          v = intToBuffer(v);
      }
      else if (v === null || v === undefined) {
          v = Buffer.allocUnsafe(0);
      }
      else if (BN.isBN(v)) {
          v = v.toArrayLike(Buffer);
      }
      else if (v.toArray) {
          // converts a BN to a Buffer
          v = Buffer.from(v.toArray());
      }
      else {
          throw new Error('invalid type');
      }
  }
  return v;
}

exports.bufferToHex = function (buf) {
  buf = exports.toBuffer(buf);
  return '0x' + buf.toString('hex');
};

exports.setLengthLeft = function (msg, length, right) {
  if (right === void 0) { right = false; }
  var buf = zeros(length);
  msg = exports.toBuffer(msg);
  if (right) {
      if (msg.length < length) {
          msg.copy(buf);
          return buf;
      }
      return msg.slice(0, length);
  }
  else {
      if (msg.length < length) {
          msg.copy(buf, length - msg.length);
          return buf;
      }
      return msg.slice(-length);
  }
};

function zeros(bytes) {
  return Buffer.allocUnsafe(bytes).fill(0);
};


// remaining functions copied from ethjs-util

function isHexString(value, length) {
  if (typeof value !== 'string' || !value.match(/^0x[0-9A-Fa-f]*$/)) {
    return false;
  }

  if (length && value.length !== 2 + 2 * length) {
    return false;
  }

  return true;
}

function padToEven(value) {
  var a = value; // eslint-disable-line

  if (typeof a !== 'string') {
    throw new Error('[ethjs-util] while padding to even, value must be string, is currently ' + typeof a + ', while padToEven.');
  }

  if (a.length % 2) {
    a = '0' + a;
  }

  return a;
}

function stripHexPrefix(str) {
  if (typeof str !== 'string') {
    return str;
  }

  return isHexPrefixed(str) ? str.slice(2) : str;
}

function isHexPrefixed(str) {
  if (typeof str !== 'string') {
    throw new Error("[is-hex-prefixed] value must be type 'string', is currently type " + (typeof str) + ", while checking isHexPrefixed.");
  }

  return str.slice(0, 2) === '0x';
}

function intToBuffer(i) {
  var hex = intToHex(i);

  return new Buffer(padToEven(hex.slice(2)), 'hex');
}

function intToHex(i) {
  var hex = i.toString(16); // eslint-disable-line

  return '0x' + hex;
}