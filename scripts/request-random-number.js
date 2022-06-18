const { ethers } = require('hardhat')

const CONTRACT_ADDRESS = '0x03c9c44378CE78e7D30ae90645024d0212e269B5' // rinkeby
const CONTRACT_NAME = 'RandomnessLogger'

const CALLBACK_GAS_LIMIT = 100000

async function main () {

    const signer = ethers.provider.getSigner()
    const contract = await ethers.getContractAt(CONTRACT_NAME, CONTRACT_ADDRESS, signer)

    const transaction = await contract.requestRandomNumbers(CALLBACK_GAS_LIMIT)
    const receipt = await transaction.wait()
    console.log(`Request ID = ${receipt.events[1].args.requestId}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })