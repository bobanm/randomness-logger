<script lang="ts">

export default {
    props: ['isReadOnly'],
}

</script>

<template>

<section class="top-orange">
    <img src="../images/batman.svg" class="right zoom">
    <h2>Status</h2>
    <div v-if="isReadOnly">
        Web3 wallet not detected. The app is now working in read-only mode.<br/>
        To be able to request a random number, please install a web3 wallet such as MetaMask, or even better, use Brave browser.
    </div>
    <div v-else>Web3 wallet connected.<br/>Address <slot></slot></div>
</section>

</template>