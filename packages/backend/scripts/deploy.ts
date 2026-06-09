import hre from 'hardhat'
import { CONTRACT_NAME, VRF_SUBSCRIPTION_ID } from '../../../config/app.config'

const { ethers } = await hre.network.create()

const contractFactory = await ethers.getContractFactory(CONTRACT_NAME)
const contract = await contractFactory.deploy(VRF_SUBSCRIPTION_ID)

const address = await contract.getAddress()
const tx = contract.deploymentTransaction()

console.log(`Transaction ${tx?.hash} is deploying contract ${address}`)
await contract.waitForDeployment()
console.log('Contract successfully deployed')
