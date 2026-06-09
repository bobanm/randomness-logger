<script setup lang="ts">

import { ref, onMounted } from 'vue'
import { ethers } from 'ethers'
import '@randomness-logger/shared'
import { CONTRACT_ADDRESS, CONTRACT_ABI, CONTRACT_BLOCK_DEPLOYED, Network } from '../../../app.config'
import type { HistoryEntry } from './types'

import Status from './components/Status.vue'
import Subscription from './components/Subscription.vue'
import History from './components/History.vue'
import Error from './components/Error.vue'

let provider: ethers.BrowserProvider | ethers.AbstractProvider
let signer: ethers.JsonRpcSigner
let RandomnessLogger: ethers.Contract

const accountAddress = ref('')
const history = ref<HistoryEntry[]>([])
const errorMessage = ref('')
const isReadOnly = ref(false)
const requestMessages = ref<string[]>([])
const responseMessages = ref<string[]>([])
const isRequestFulfilled = ref(false)

const subscription = ref<InstanceType<typeof Subscription> | null>(null)

onMounted(async () => {

    await init()

    if (!isReadOnly.value) {
        window.ethereum.on('chainChanged', () => { init() })
        window.ethereum.on('accountsChanged', () => { initAccount() })
    }
})

async function init () {

    history.value = []
    errorMessage.value = ''
    requestMessages.value = []
    responseMessages.value = []
    isRequestFulfilled.value = false

    if (window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum)
        isReadOnly.value = false
    }
    else {
        provider = ethers.getDefaultProvider(Network.NAME)
        isReadOnly.value = true
    }

    const providerNetwork = await provider.getNetwork()

    if (Number(providerNetwork.chainId) !== Network.ID) {
        errorMessage.value = 'The smart contract is currently deployed only on Sepolia network. Please switch your wallet to Sepolia.'

        return
    }

    RandomnessLogger = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)

    await fetchHistory()
    registerEventListeners()
    if (!isReadOnly.value) {
        await initAccount()
    }
}

function registerEventListeners () {

    RandomnessLogger.on('NumberRequested', (requestId: bigint, requestBlockNumber: bigint, requestTimestamp: bigint, requestorAddress: string) => {

        const newHistoryEntry: HistoryEntry = {
            requestId,
            requestBlockNumber,
            requestTimestamp,
            requestorAddress,
        }

        // add new history entry if an entry with the same ID isn't already registered
        const historyEntry = getHistoryEntry(requestId)

        if (!historyEntry) {
            history.value.unshift(newHistoryEntry)
        }
    })

    RandomnessLogger.on('NumberReceived', async (requestId: bigint, responseBlockNumber: bigint, responseTimestamp: bigint, randomNumber: bigint) => {

        for (const historyEntry of history.value) {

            if (historyEntry.requestId.toString() === requestId.toString()) {
                historyEntry.responseBlockNumber = responseBlockNumber
                historyEntry.responseTimestamp = responseTimestamp
                historyEntry.randomNumber = randomNumber

                // only display the final confirmation if it was the user who requested the random number
                if (requestMessages.value.length && responseMessages.value.length) {
                    isRequestFulfilled.value = true
                }

                break
            }
        }

        await subscription.value?.update()
    })
}

function getHistoryEntry (requestId: bigint): HistoryEntry | undefined {

    for (const historyEntry of history.value) {
        if (historyEntry.requestId.toString() === requestId.toString()) {

            return historyEntry
        }
    }
}

async function initAccount () {

    const accounts = await (provider as ethers.BrowserProvider).send('eth_requestAccounts', [])
    accountAddress.value = accounts[0]!
    signer = await (provider as ethers.BrowserProvider).getSigner()
    RandomnessLogger = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
}

async function fetchHistory () {

    const filterRequests = RandomnessLogger.filters.NumberRequested()
    const filterResponses = RandomnessLogger.filters.NumberReceived()

    const [requestsLog, responsesLog] = await Promise.all([
        RandomnessLogger.queryFilter(filterRequests, CONTRACT_BLOCK_DEPLOYED),
        RandomnessLogger.queryFilter(filterResponses, CONTRACT_BLOCK_DEPLOYED),
    ]) as [ethers.EventLog[], ethers.EventLog[]]

    for (const requestsLogEntry of requestsLog) {

        const historyEntry: HistoryEntry = {
            requestBlockNumber: requestsLogEntry.args.blockNumber as bigint,
            requestTimestamp: requestsLogEntry.args.timestamp as bigint,
            requestId: requestsLogEntry.args.requestId as bigint,
            requestorAddress: requestsLogEntry.args.requestorAddress as string,
        }

        // search through responses log array, match with requests array on requestId and assign missing values
        for (const responsesLogEntry of responsesLog) {

            if ((responsesLogEntry.args.requestId as bigint).toString() === (requestsLogEntry.args.requestId as bigint).toString()) {
                historyEntry.responseBlockNumber = responsesLogEntry.args.blockNumber as bigint
                historyEntry.responseTimestamp = responsesLogEntry.args.timestamp as bigint
                historyEntry.randomNumber = responsesLogEntry.args.randomNumber as bigint

                break
            }
        }

        history.value.unshift(historyEntry)
    }
}

async function requestRandomNumber () {

    requestMessages.value.length = 0
    responseMessages.value.length = 0
    isRequestFulfilled.value = false

    const transaction = await RandomnessLogger.requestRandomNumber()
    requestMessages.value.push(
        `Requested a random number`,
        `Transaction ${transaction.hash}`,
        `Waiting for the transaction to be mined...`,
    )
    const receipt = await transaction.wait()

    if (receipt) {
        const log = receipt.logs.find((log: ethers.Log) => {
            const parsed = RandomnessLogger.interface.parseLog(log)

            return parsed?.name === 'NumberRequested'
        })

        if (log) {
            const parsed = RandomnessLogger.interface.parseLog(log)!

            responseMessages.value.push(
                `Confirmed in block ${parsed.args.blockNumber}`,
                `Request ID ${parsed.args.requestId}`,
                `Chainlink VRF will fulfill it in about 3 blocks. Stay tuned...`,
            )
        }
    }
}

</script>

<template>
    <main v-if="!errorMessage">
        <Status :isReadOnly="isReadOnly">{{ accountAddress }}</Status>

        <Suspense>
            <Subscription ref="subscription"/>
        </Suspense>

        <History :history="history"/>

        <section id="request" class="top-red">
            <img src="./images/santa.svg" class="right zoom">
            <button @click="requestRandomNumber" :disabled="isReadOnly" class="btn-red">Request a new random number</button>
            <div v-if="isReadOnly" class="start">
                It is not possible to request a new random number from Chainlink without a web3 wallet.<br/>
                You can still browse all the previously generated random numbers, shown in the table above.
            </div>
            <div v-if="requestMessages.length" class="start">
                <div v-for="message of requestMessages">{{ message }}</div>
            </div>
            <div v-if="responseMessages.length" class="start">
                <div v-for="message of responseMessages">{{ message }}</div>
            </div>
            <div v-if="isRequestFulfilled" class="start">
                <div>Request fulfilled successfully</div>
            </div>
        </section>
    </main>
    <main v-else>
        <Error>{{ errorMessage }}</Error>
    </main>

    <footer>
        <a href="https://boban.ninja/"><img src="./images/house.svg" class="zoom"></a>
        <a href="https://github.com/bobanm/randomness-logger/" target="_blank" rel="noopener noreferrer"><img src="./images/github.svg" class="zoom"></a>
    </footer>

</template>

<style>

@import './custom.css';

</style>
