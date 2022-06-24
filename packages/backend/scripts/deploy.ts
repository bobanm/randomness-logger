import { ethers } from 'hardhat'
import { CONTRACT_NAME, VRF_SUBSCRIPTION_ID } from '../../../app.config'

async function main () {

    const contractFactory = await ethers.getContractFactory(CONTRACT_NAME)
    const contract = await contractFactory.deploy(VRF_SUBSCRIPTION_ID) // pass contract constructor arguments to deploy() method

    console.log(`Transaction ${contract.deployTransaction.hash} is deploying contract ${contract.address}`)
    await contract.deployed()
    console.log('Contract successfully deployed')
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })