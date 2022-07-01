<script setup lang="ts">

import { ref, onMounted } from 'vue'
import { ethers, Contract, BigNumber, providers, ContractTransaction } from 'ethers'
import { CONTRACT_ADDRESS, CONTRACT_ABI, CONTRACT_BLOCK_DEPLOYED, DEFAULT_NETWORK } from '../../../app.config'
import './globals'

import Status from './components/Status.vue'
import History from './components/History.vue'
import Error from './components/Error.vue'

let provider: providers.Web3Provider
let signer
let RandomnessLogger: Contract

const accountAddress = ref('')
const history = ref<HistoryEntry[]>([])
const errorMessage = ref('')
const isReadOnly = ref(false)
const requestMessages = ref<string[]>([])
const responseMessages = ref<string[]>([])
const isRequestFulfilled = ref(false)

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
        provider = new ethers.providers.Web3Provider(window.ethereum)
        isReadOnly.value = false
    }
    else {
        provider = ethers.providers.getDefaultProvider(DEFAULT_NETWORK) as providers.Web3Provider
        isReadOnly.value = true
    }

    const providerNetwork = await provider.getNetwork()

    if (providerNetwork.chainId !== 4) {
        errorMessage.value = 'The smart contract is currently deployed only on Rinkeby network. Please switch your wallet to Rinkeby.'

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

    RandomnessLogger.on('NumberRequested', (requestId: BigNumber, requestBlockNumber: BigNumber, requestTimestamp: BigNumber, requestorAddress: string) => {

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

    RandomnessLogger.on('NumberReceived', (requestId: BigNumber, responseBlockNumber: BigNumber, responseTimestamp: BigNumber, randomNumber: BigNumber) => {
        
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
    })
}

function getHistoryEntry (requestId: BigNumber): HistoryEntry | undefined {

    for (const historyEntry of history.value) {
        if (historyEntry.requestId.toString() === requestId.toString()) {

            return historyEntry
        }
    }
}

async function initAccount () {

    const accounts = await provider.send('eth_requestAccounts', [])
    accountAddress.value = accounts[0]
    signer = provider.getSigner()
    RandomnessLogger = RandomnessLogger.connect(signer)
}

async function fetchHistory () {

    const filterRequests = RandomnessLogger.filters.NumberRequested()
    const filterResponses = RandomnessLogger.filters.NumberReceived()

    const [requestsLog, responsesLog] = await Promise.all([
        RandomnessLogger.queryFilter(filterRequests, CONTRACT_BLOCK_DEPLOYED),
        RandomnessLogger.queryFilter(filterResponses, CONTRACT_BLOCK_DEPLOYED),
    ])

    for (const requestsLogEntry of requestsLog) {

        const historyEntry: HistoryEntry = {
            requestBlockNumber: requestsLogEntry.args!.blockNumber,
            requestTimestamp: requestsLogEntry.args!.timestamp,
            requestId: requestsLogEntry.args!.requestId,
            requestorAddress: requestsLogEntry.args!.requestorAddress,
        }
        
        // search through responses log array, match with requests array on requestId and assign missing values
        for (const responsesLogEntry of responsesLog) {

            if (responsesLogEntry.args!.requestId.toString() === requestsLogEntry.args!.requestId.toString()) {
                historyEntry.responseBlockNumber = responsesLogEntry.args!.blockNumber
                historyEntry.responseTimestamp = responsesLogEntry.args!.timestamp
                historyEntry.randomNumber = responsesLogEntry.args!.randomNumber

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

    const transaction: ContractTransaction = await RandomnessLogger.requestRandomNumber()
    requestMessages.value.push(
        `Requested a random number`,
        `Transaction ${transaction.hash}`,
        `Waiting for the transaction to be mined...`,
    )
    const receipt = await transaction.wait()

    responseMessages.value.push(
        `Confirmed in block ${receipt.events![1].args!.blockNumber}`,
        `Request ID ${receipt.events![1].args!.requestId}`,
        `Chainlink VRF will fulfill it in about 3 blocks. Stay tuned...`,
    )
}

</script>

<template>
    <main>
        <Status v-if="!errorMessage" :isReadOnly="isReadOnly">{{ accountAddress }}</Status>

        <History v-if="!errorMessage" :history="history"/>

        <section id="request" v-if="!errorMessage" class="top-red">
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

        <Error v-if="errorMessage">{{ errorMessage }}</Error>
    </main>

    <footer>
        <a href="https://boban.ninja/"><img src="./images/house.svg" class="zoom"></a>
        <a href="https://github.com/bobanm/randomness-logger/" target="_blank" rel="noopener noreferrer"><img src="./images/github.svg" class="zoom"></a>
    </footer>

</template>

<style>

@import './custom.css';

</style>
