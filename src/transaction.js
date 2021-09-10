const { decode, toBuffer } = require('eth-util-lite')
const EthObject = require('./ethObject')

class Transaction extends EthObject{

  static get fields(){ return [
    'chainId',
    'nonce',
    'maxPriorityFeePerGas',
    'maxFeePerGas',
    'gasLimit',
    'to',
    'value',
    'data',
    'accessList',
    'v',
    'r',
    's',
  ] }

  constructor(raw = Transaction.NULL){
    super(Transaction.fields, raw)
  }
  static fromBuffer(buf){ 
    if(buf) {
      // marker for EIP2718 TX Envelope type - anything under is type followed by RLP, over is standard RLP
      if(buf[0] > 0x7f) {
        return new Transaction(decode(buf))
      } else {
        let tx = new Transaction(decode(buf.slice(1)))
        tx.objtype = toBuffer(buf[0])
        return tx
      }
    } else {
      return new Transaction() 
    }
  }

  static fromHex(hex){ 
    return this.fromBuffer(toBuffer(hex))
  }
  static fromRaw(raw){ return new Transaction(raw) }
  static fromObject(rpcResult){ return Transaction.fromRpc(rpcResult) }
  static fromRpc(rpcResult){
    // see definitions: https://eips.ethereum.org/EIPS/eip-1559
    // https://eips.ethereum.org/EIPS/eip-2718 1559-payload
    if(rpcResult.type == "0x2") {
      let accessList = []
      for (var i = 0; i < rpcResult.accessList.length; i++) {
        var listObjAtIndex = rpcResult.accessList[i]
        var storageKeys = []
        for (var j = 0; j < listObjAtIndex.storageKeys.length; j++) {
          storageKeys.push(toBuffer(listObjAtIndex.storageKeys[j]))
        }
        accessList.push([toBuffer(listObjAtIndex.address), storageKeys])
      }
      let tx = new Transaction([
        toBuffer(rpcResult.chainId),
        toBuffer(rpcResult.nonce),
        toBuffer(rpcResult.maxPriorityFeePerGas),
        toBuffer(rpcResult.maxFeePerGas),
        toBuffer(rpcResult.gas || rpcResult.gasLimit),
        toBuffer(rpcResult.to),
        toBuffer(rpcResult.value),
        toBuffer(rpcResult.input || rpcResult.data),
        accessList,
        toBuffer(rpcResult.v),
        toBuffer(rpcResult.r),
        toBuffer(rpcResult.s)
      ])
      tx.objtype = toBuffer(rpcResult.type)
      return tx
    // https://eips.ethereum.org/EIPS/eip-2718 2930-payload
    } else if(rpcResult.type == "0x1") {
      let accessList = []
      for (var i = 0; i < rpcResult.accessList.length; i++) {
        var listObjAtIndex = rpcResult.accessList[i]
        var storageKeys = []
        for (var j = 0; j < listObjAtIndex.storageKeys.length; j++) {
          storageKeys.push(toBuffer(listObjAtIndex.storageKeys[j]))
        }
        accessList.push([toBuffer(listObjAtIndex.address), storageKeys])
      }
      let tx = new Transaction([
        toBuffer(rpcResult.chainId),
        toBuffer(rpcResult.nonce),
        toBuffer(rpcResult.gasPrice),
        toBuffer(rpcResult.gas || rpcResult.gasLimit),
        toBuffer(rpcResult.to),
        toBuffer(rpcResult.value),
        toBuffer(rpcResult.input || rpcResult.data),
        accessList,
        toBuffer(rpcResult.v),
        toBuffer(rpcResult.r),
        toBuffer(rpcResult.s)
      ])
      tx.objtype = toBuffer(rpcResult.type)
      return tx
    }
    else {
      return new Transaction([
        toBuffer(rpcResult.nonce),
        toBuffer(rpcResult.gasPrice),
        toBuffer(rpcResult.gas || rpcResult.gasLimit),
        toBuffer(rpcResult.to),
        toBuffer(rpcResult.value),
        toBuffer(rpcResult.input || rpcResult.data),
        toBuffer(rpcResult.v),
        toBuffer(rpcResult.r),
        toBuffer(rpcResult.s)
      ])  
    }
  }
}

module.exports = Transaction
