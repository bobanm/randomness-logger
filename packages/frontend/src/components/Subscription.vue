<script setup lang="ts">

import { ethers } from 'ethers'
import { ref, inject } from 'vue';
import type { Ref } from 'vue'
import { VRF_CONTRACT_ADDRESS, VRF_CONTRACT_ABI, VRF_SUBSCRIPTION_ID } from '../../../../config/app.config';

type Subscription = {
    owner: string,
    balance: bigint,
    reqCount: bigint,
    consumers: string[],
}

const infuraProvider = inject('infuraProvider') as ethers.JsonRpcProvider

let subscription: Ref<Subscription> = ref({
    owner: '',
    balance: 0n,
    reqCount: 0n,
    consumers: [],
})

const VrfContract = new ethers.Contract(VRF_CONTRACT_ADDRESS, VRF_CONTRACT_ABI, infuraProvider)
// do not await update, so that the component renders immediately with empty values
update()

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
        Remaining balance {{ Number(ethers.formatUnits(subscription.balance)).toPrecision(6) }} LINK<br/>
        Fulfilled {{ subscription.reqCount.toString() }} requests
    </div>
</section>

</template>
