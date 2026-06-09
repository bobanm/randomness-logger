<script setup lang="ts">

import { ref, onMounted, onUnmounted, provide } from 'vue'
import { ethers } from 'ethers'
import '@randomness-logger/shared'
import { CONTRACT_ADDRESS, CONTRACT_ABI, CONTRACT_BLOCK_DEPLOYED, Network } from '../../../config/app.config'
import { SEPOLIA_URL } from '../../../config/credentials'
import type { HistoryEntry } from './types'

import Status from './components/Status.vue'
import Subscription from './components/Subscription.vue'
import History from './components/History.vue'
import Error from './components/Error.vue'

const cloudProvider = new ethers.JsonRpcProvider(SEPOLIA_URL)
provide('cloudProvider', cloudProvider)

let browserProvider: ethers.BrowserProvider | undefined
let RandomnessLoggerReader: ethers.Contract
let RandomnessLoggerWriter: ethers.Contract | undefined

const accountAddress = ref('')
const history = ref<HistoryEntry[]>([])
const errorMessage = ref('')
const isReadOnly = ref(false)
const requestMessages = ref<string[]>([])
const responseMessages = ref<string[]>([])
const isRequestFulfilled = ref(false)

const subscription = ref<InstanceType<typeof Subscription> | null>(null)

const onChainChanged = async () => { await init() }
const onAccountsChanged = async () => { await initAccount() }

onMounted(async () => {

    await init()

    if (!isReadOnly.value) {
        window.ethereum.on('chainChanged', onChainChanged)
        window.ethereum.on('accountsChanged', onAccountsChanged)
    }
})

onUnmounted(() => {

    window.ethereum?.removeListener('chainChanged', onChainChanged)
    window.ethereum?.removeListener('accountsChanged', onAccountsChanged)
})

async function init () {

    history.value = []
    errorMessage.value = ''
    requestMessages.value = []
    responseMessages.value = []
    isRequestFulfilled.value = false
    isReadOnly.value = true

    RandomnessLoggerReader = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, cloudProvider)

    const providerNetwork = await cloudProvider.getNetwork()

    if (Number(providerNetwork.chainId) !== Network.ID) {
        errorMessage.value = 'The smart contract is currently deployed only on Sepolia network. Please switch your wallet to Sepolia.'

        return
    }

    history.value = await fetchHistory()

    if (window.ethereum) {
        browserProvider = new ethers.BrowserProvider(window.ethereum)
        await initAccount()
        isReadOnly.value = false
    }
}

function registerEventListeners () {

    RandomnessLoggerWriter!.on('NumberRequested', (requestId: bigint, requestBlockNumber: bigint, requestTimestamp: bigint, requestorAddress: string) => {

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

    RandomnessLoggerWriter!.on('NumberReceived', async (requestId: bigint, responseBlockNumber: bigint, responseTimestamp: bigint, randomNumber: bigint) => {

        for (const historyEntry of history.value) {

            if (historyEntry.requestId === requestId) {
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

    const signer = await browserProvider!.getSigner()
    accountAddress.value = await signer.getAddress()
    RandomnessLoggerWriter?.removeAllListeners()
    RandomnessLoggerWriter = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
    registerEventListeners()
}

async function fetchHistory (): Promise<HistoryEntry[]> {

    const historyLog: HistoryEntry[] = []
    const filterRequests = RandomnessLoggerReader.filters.NumberRequested()
    const filterResponses = RandomnessLoggerReader.filters.NumberReceived()

    const [requestsLog, responsesLog] = await Promise.all([
        RandomnessLoggerReader.queryFilter(filterRequests, CONTRACT_BLOCK_DEPLOYED),
        RandomnessLoggerReader.queryFilter(filterResponses, CONTRACT_BLOCK_DEPLOYED),
    ]) as [ethers.EventLog[], ethers.EventLog[]]

    // search through responses log array, match with requests log array on requestId
    for (const responsesLogEntry of responsesLog) {
        for (const requestsLogEntry of requestsLog) {

            if (responsesLogEntry.args.requestId as bigint === requestsLogEntry.args.requestId as bigint) {
                historyLog.unshift({
                    requestId: requestsLogEntry.args.requestId as bigint,
                    requestBlockNumber: requestsLogEntry.args.blockNumber as bigint,
                    requestTimestamp: requestsLogEntry.args.timestamp as bigint,
                    requestorAddress: requestsLogEntry.args.requestorAddress as string,
                    responseBlockNumber: responsesLogEntry.args.blockNumber as bigint,
                    responseTimestamp: responsesLogEntry.args.timestamp as bigint,
                    randomNumber: responsesLogEntry.args.randomNumber as bigint,
                } satisfies HistoryEntry)

                break
            }
        }
    }

    return historyLog
}

async function requestRandomNumber () {

    requestMessages.value.length = 0
    responseMessages.value.length = 0
    isRequestFulfilled.value = false

    const transaction = await RandomnessLoggerWriter!.requestRandomNumber()
    requestMessages.value.push(
        `Requested a random number`,
        `Transaction ${transaction.hash}`,
        `Waiting for the transaction to be mined...`,
    )
    const receipt = await transaction.wait()

    if (receipt) {
        const log = receipt.logs.find((log: ethers.Log) => {
            const parsed = RandomnessLoggerReader.interface.parseLog(log)

            return parsed?.name === 'NumberRequested'
        })

        if (log) {
            const parsed = RandomnessLoggerReader.interface.parseLog(log)!

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
