const { encode, toHex } = require('eth-util-lite')

class EthObject extends Array{
  set objtype(typeIn) {
    this.type = typeIn;
  }
  constructor(fields, raw){
//raw array
    super(...raw)

// properties
    fields.forEach((field, i)=>{
      Object.defineProperty(this, field, {
        value: this[i],
        writable: false
      });
    })

    Object.defineProperty(this, 'fields', {
      value: fields,
      writable: false
    });

// methods
    Object.defineProperty(this, 'buffer', {
      get: function(){ return encode(this.raw) },
    });
    Object.defineProperty(this, 'hex', {
      get: function(){ return toHex(this.buffer) },
    });
    Object.defineProperty(this, 'raw', {
      // only commit to data from fields that exist, since we have multiple transaction formats now we will be missing data depending on the tx type
      // so we need to skip so the root's are correctly calculated still
      get: function(){ 
        return this.fields.filter((field, i) => {
          return this[i] !== undefined;
        }).map((field, i) => {
          return this[i];
        })
      },
    });
    Object.defineProperty(this, 'object', {
      get: function(){
        let obj = {}
        this.fields.forEach((field, index)=>{
          if(this[index] instanceof Array){
            obj[field] = this[index] 
          }else{
            obj[field] = toHex(this[index])   
          }
        })
        return obj
      },
    });
    Object.defineProperty(this, 'json', {
      get: function(){ return JSON.stringify(this.object) },
    });
  }

// aliases
  serialize(){ 
    // if type is defined, concat type and RLP buffer seperately (for receipts/transactions following EIP2718)
    if(this.type) {
      return Buffer.concat([this.type, this.buffer ])
    } else {
      return this.buffer 
    }
  }
  toBuffer(){ 
    // if type is defined, concat type and RLP buffer seperately (for receipts/transactions following EIP2718)
    if(this.type) {
      return Buffer.concat([this.type, this.buffer ])
    } else {
      return this.buffer 
    }
  }
  toHex(){     return this.hex }
  toObject(){  return this.object }
  toString(){  return this.json }
  toJson(){    return this.json }
}

module.exports = EthObject
