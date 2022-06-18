const { ethers } = require('hardhat')

const CONTRACT_ADDRESS = '0x6168499c0cFfCaCD319c818142124B7A15E857ab'
const CONTRACT_ABI = [
    'function getSubscription(uint64 subId) external view returns (uint96 balance, uint64 reqCount, address owner, address[] memory consumers)',
]
const SUBSCRIPTION_ID = 5853

async function main () {

    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, ethers.provider)

    const subscription = await contract.getSubscription(SUBSCRIPTION_ID)
    console.log(subscription)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })