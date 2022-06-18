const { ethers } = require('hardhat')

const { VRF_CONTRACT_ADDRESS, VRF_CONTRACT_ABI, VRF_SUBSCRIPTION_ID } = require('../app.config')

async function main () {

    const Vrf = new ethers.Contract(VRF_CONTRACT_ADDRESS, VRF_CONTRACT_ABI, ethers.provider)
    const subscription = await Vrf.getSubscription(VRF_SUBSCRIPTION_ID)
    console.log(subscription)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })