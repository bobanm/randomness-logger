import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'

import { VRF_CONTRACT_ADDRESS, VRF_CONTRACT_ABI, VRF_SUBSCRIPTION_ID } from '../app.config'

async function main () {

    type SubscriptionResponse = {
        owner: string,
        balance: BigNumber,
        reqCount: BigNumber,
        consumers: string[],
    }

    const Vrf = new ethers.Contract(VRF_CONTRACT_ADDRESS, VRF_CONTRACT_ABI, ethers.provider)
    const subscription: SubscriptionResponse = await Vrf.getSubscription(VRF_SUBSCRIPTION_ID)

    console.log(`owner      ${subscription.owner}`)
    console.log(`balance    ${ethers.utils.formatUnits(subscription.balance)} LINK`)
    console.log(`fulfilled  ${subscription.reqCount.toNumber()} requests`)
    
    if (subscription.consumers) {
        console.log('\nconsumers')
        for (const consumer of subscription.consumers) {
            console.log(`  ${consumer}`)
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })