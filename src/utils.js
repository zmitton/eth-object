const Util = require('./dependencyUtils');
const rlp = require('rlp');

const keccak = Util.keccak
const encode = (input) => {
  return input === "0x0" ? rlp.encode(Buffer.from([])) : rlp.encode(input)
}
const decode = rlp.decode
const toBuffer = (input) => {
  return input === "0x0" ? Buffer.from([]) : Util.toBuffer(input)
}
const toHex = (input) => {
  if (input instanceof Array) {
    return toHex(encode(input))
  } else {
    return Util.bufferToHex(input)
  }
}
const toWord = (input) => {
  return Util.setLengthLeft(toBuffer(input), 32)
}

const mappingAt = (...keys) => { // first key is mapping's position
  keys[0] = toWord(keys[0])
  return toHex(keys.reduce((positionAccumulator, key) => {
    return keccak(Buffer.concat([toWord(key), positionAccumulator]))
  }))
}

module.exports = { keccak, encode, decode, toBuffer, toHex, toWord, mappingAt }
