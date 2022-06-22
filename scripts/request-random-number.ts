import { ethers } from 'hardhat'
import { ContractTransaction } from 'ethers'

import { CONTRACT_NAME, CONTRACT_ADDRESS, CALLBACK_GAS_LIMIT } from '../app.config'

async function main () {

    const signer = ethers.provider.getSigner()
    const RandomnessLogger = await ethers.getContractAt(CONTRACT_NAME, CONTRACT_ADDRESS, signer)

    const transaction: ContractTransaction = await RandomnessLogger.requestRandomNumbers(CALLBACK_GAS_LIMIT)
    console.log('Requested a random number. Waiting for the transaction to be mined...')
    const receipt = await transaction.wait()
    console.log(`Request ID = ${receipt.events![1].args!.requestId}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })