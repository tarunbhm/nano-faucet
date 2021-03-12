const web3 = require('@services/web3')

const TRANSACTION_GAS = '21000'
const TRANSACTION_GAS_PRICE = web3.utils.toWei('4', 'gwei')

module.exports = {
  async sign({ from, to, value, key }) {
    let gas = new web3.utils.BN(TRANSACTION_GAS)
    let gasPrice = new web3.utils.BN(TRANSACTION_GAS_PRICE)
    let chainId = await web3.eth.net.getId()
    
    const nonce = await web3.eth.getTransactionCount(from, "pending")
    const nonceHex = web3.utils.toHex(nonce)
    console.log("transaction nonce", nonce, nonceHex);

    const tx = {
      from,
      to,
      gas: gas.toString(),
      gasPrice: gasPrice.toString(),
      value,
      chainId,
      nonce: nonceHex
    }

    return web3.eth.accounts.signTransaction(tx, `0x${key}`)
  },

  send(signedTransaction) {
    return new Promise((resolve, reject) => {
      web3.eth
        .sendSignedTransaction(signedTransaction.rawTransaction)
        .once('confirmation', (confirmationNumber, receipt) => {
          if (receipt.status === '0x0') {
            reject(receipt)
          } else {
            resolve(receipt)
          }
        })
        .once('error', error => {
          reject(error)
        })
    })
  }
}
