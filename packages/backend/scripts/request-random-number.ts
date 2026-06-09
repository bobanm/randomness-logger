import hre from 'hardhat'
import { CONTRACT_NAME, CONTRACT_ADDRESS } from '../../../config/app.config'

const { ethers } = await hre.network.create()

const signers = await ethers.getSigners()
const signer = signers[0]
const RandomnessLogger = await ethers.getContractAt(CONTRACT_NAME, CONTRACT_ADDRESS, signer)

const transaction = await RandomnessLogger.requestRandomNumber()
console.log('Requested a random number. Waiting for the transaction to be mined...')
const receipt = await transaction.wait()

if (receipt && receipt.logs[1]) {
    const parsedLog = RandomnessLogger.interface.parseLog(receipt.logs[1])
    console.log(`Request ID = ${parsedLog!.args.requestId}`)
}
