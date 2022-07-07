<script setup lang="ts">

import { ethers, providers, BigNumber } from 'ethers'
import { ref } from 'vue';
import type { Ref } from 'vue'
import { DEFAULT_NETWORK, VRF_CONTRACT_ADDRESS, VRF_CONTRACT_ABI, VRF_SUBSCRIPTION_ID } from '../../../../app.config';

type Subscription = {
    owner: string,
    balance: BigNumber,
    reqCount: BigNumber,
    consumers: string[],
}

let provider: providers.Web3Provider
let subscription: Ref<Subscription> = ref({
    owner: '',
    balance: BigNumber.from(0),
    reqCount: BigNumber.from(0),
    consumers: [],
})

if (window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum)
}
else {
    provider = ethers.providers.getDefaultProvider(DEFAULT_NETWORK) as providers.Web3Provider
}

const VrfContract = new ethers.Contract(VRF_CONTRACT_ADDRESS, VRF_CONTRACT_ABI, provider)
await update()

// update functionality is inside a method, so it could be invoked also by the parent component
async function update() {
    subscription.value = await VrfContract.getSubscription(VRF_SUBSCRIPTION_ID) as Subscription
}

defineExpose({ update })

</script>

<template>

<section id="subscription" class="top-blue">
    <img src="../images/hipster.svg" class="right zoom">
    <h2>Subscription {{ VRF_SUBSCRIPTION_ID }}</h2>
    <div>
        Owner {{ subscription.owner }}<br/>
        Remaining balance {{ Number(ethers.utils.formatUnits(subscription.balance)).toPrecision(6) }} LINK<br/>
        Fulfilled {{ subscription.reqCount.toString() }} requests
    </div>
</section>

</template>