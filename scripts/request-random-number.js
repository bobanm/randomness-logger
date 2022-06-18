const { ethers } = require('hardhat')

const { CONTRACT_NAME, CONTRACT_ADDRESS, CALLBACK_GAS_LIMIT } = require('../app.config')

async function main () {

    const signer = ethers.provider.getSigner()
    const RandomnessLogger = await ethers.getContractAt(CONTRACT_NAME, CONTRACT_ADDRESS, signer)

    const transaction = await RandomnessLogger.requestRandomNumbers(CALLBACK_GAS_LIMIT)
    const receipt = await transaction.wait()
    console.log(`Request ID = ${receipt.events[1].args.requestId}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })