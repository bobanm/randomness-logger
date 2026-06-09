import hre from 'hardhat'

import { VRF_CONTRACT_ADDRESS, VRF_CONTRACT_ABI, VRF_SUBSCRIPTION_ID } from '../../../config/app.config'

const { ethers } = await hre.network.create()

type SubscriptionResponse = {
    owner: string,
    balance: bigint,
    reqCount: bigint,
    consumers: string[],
}

const Vrf = new ethers.Contract(VRF_CONTRACT_ADDRESS, VRF_CONTRACT_ABI, ethers.provider)
const subscription: SubscriptionResponse = await Vrf.getSubscription!(VRF_SUBSCRIPTION_ID)

console.log(`owner      ${subscription.owner}`)
console.log(`balance    ${Number(ethers.formatUnits(subscription.balance)).toPrecision(6)} LINK`)
console.log(`fulfilled  ${Number(subscription.reqCount)} requests`)

if (subscription.consumers) {
    console.log('\nconsumers')
    for (const consumer of subscription.consumers) {
        console.log(`  ${consumer}`)
    }
}
