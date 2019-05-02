const keccak256 = require('js-sha3').keccak256
const BN = require('bn.js')
const rlp = require('rlp')
const Buffer = require('safe-buffer').Buffer

const encode = (input) => {
  return input === "0x0" ? rlp.encode(Buffer.from([])) : rlp.encode(input)
}

const decode = rlp.decode

const toBuffer = (input) => {
  return input === "0x0" ? Buffer.from([]) : _toBuffer(input)
}

const keccak = input => toBuffer(_keccak(input))

const toHex = (input) => {
  if (input instanceof Array) {
    return toHex(encode(input))
  } else {
    return bufferToHex(input)
  }
}

const toWord = (input) => {
  return setLengthLeft(toBuffer(input), 32)
}

const mappingAt = (...keys) => { // first key is mapping's position
  keys[0] = toWord(keys[0])
  return toHex(keys.reduce((positionAccumulator, key) => {
    return keccak(Buffer.concat([toWord(key), positionAccumulator]))
  }))
}

module.exports = { keccak, encode, decode, toBuffer, toHex, toWord, mappingAt }


// following 5 functions adapted or copied from ethereumjs-util

function _keccak(a) {
  a = _toBuffer(a);
  return keccak256.create().update(a).digest();
}

function _toBuffer(v) {
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

function bufferToHex(buf) {
  buf = _toBuffer(buf);
  return '0x' + buf.toString('hex');
}

function setLengthLeft(msg, length, right) {
  if (right === void 0) { right = false; }
  var buf = zeros(length);
  msg = _toBuffer(msg);
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
}

function zeros(bytes) {
  return Buffer.allocUnsafe(bytes).fill(0);
}


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