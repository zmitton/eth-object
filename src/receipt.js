const { decode, toBuffer } = require('eth-util-lite')
const EthObject = require('./ethObject')
const Log = require('./log')

class Receipt extends EthObject{

  static get fields(){ return [
    'postTransactionState',
    'cumulativeGasUsed',
    'bloomFilter',
    'setOfLogs'
  ] }

  constructor(raw = Receipt.NULL){
    super(Receipt.fields, raw)
  }

  static fromBuffer(buf){ 
    if(buf) {
      // marker for EIP2718 TX Envelope type - anything under is type followed by RLP, over is standard RLP
      if(buf[0] > 0x7f) {
        return new Receipt(decode(buf))
      } else {
        let receipt = new Receipt(decode(buf.slice(1)))
        receipt.objtype = toBuffer(buf[0])
        return receipt
      }
    } else {
      return new Receipt() 
    }
  }
  static fromHex(hex){ 
    return this.fromBuffer(toBuffer(hex))
  }
  static fromRaw(raw){ return new Receipt(raw) }
  static fromObject(rpcResult){ return Receipt.fromRpc(rpcResult) }
  static fromRpc(rpcResult){
    let logs = []
    for (var i = 0; i < rpcResult.logs.length; i++) {
       logs.push(Log.fromRpc(rpcResult.logs[i]))
    }
    let receipt = new Receipt([
      toBuffer(rpcResult.status || rpcResult.root),
      toBuffer(rpcResult.cumulativeGasUsed),
      toBuffer(rpcResult.logsBloom),
      logs
    ])
    if(rpcResult.type) {
      receipt.objtype = toBuffer(rpcResult.type)
    }
    return receipt
  }
}

module.exports = Receipt
