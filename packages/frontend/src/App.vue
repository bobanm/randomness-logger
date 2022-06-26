<script lang="ts">

import { defineComponent } from 'vue'
import { ethers, Contract, BigNumber, providers, ContractTransaction } from 'ethers'
import { CONTRACT_ADDRESS, CONTRACT_ABI, CONTRACT_BLOCK_DEPLOYED, DEFAULT_NETWORK } from '../../../app.config'
import './globals'

type HistoryEntry = {
    requestId: BigNumber,
    requestBlockNumber: BigNumber,
    requestTimestamp: BigNumber,
    requestorAddress: string,
    responseBlockNumber?: BigNumber,
    responseTimestamp?: BigNumber,
    randomNumber?: BigNumber,
}

let provider: providers.Web3Provider
let signer
let RandomnessLogger: Contract

export default defineComponent({
    data () {
        return {
            accountAddress: '',
            history: [] as HistoryEntry[],
            errorMessage: '',
            isReadOnly: false,
            requestMessages: [] as string[],
            responseMessages: [] as string[],
            isRequestFulfilled: false,
        }
    },

    methods: {

        async init () {

            this.history = []
            this.errorMessage = ''
            this.requestMessages = []
            this.responseMessages = []
            this.isRequestFulfilled = false

            if (window.ethereum) {
                provider = new ethers.providers.Web3Provider(window.ethereum)
                this.isReadOnly = false
            }
            else {
                provider = ethers.providers.getDefaultProvider(DEFAULT_NETWORK) as providers.Web3Provider
                this.isReadOnly = true
            }

            const providerNetwork = await provider.getNetwork()

            if (providerNetwork.chainId !== 4) {
                this.errorMessage = 'The smart contract is currently deployed only on Rinkeby network. Please switch your wallet to Rinkeby.'

                return
            }

            RandomnessLogger = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)

            await this.fetchHistory()
            this.registerEventListeners()
            if (!this.isReadOnly) {
                await this.initAccount()
            }
        },

        registerEventListeners () {

            RandomnessLogger.on('NumberRequested', (requestId: BigNumber, requestBlockNumber: BigNumber, requestTimestamp: BigNumber, requestorAddress: string) => {

                const newHistoryEntry: HistoryEntry = {
                    requestId,
                    requestBlockNumber,
                    requestTimestamp,
                    requestorAddress,
                }

                // add new history entry if an entry with the same ID isn't already registered
                const historyEntry = this.getHistoryEntry(requestId)

                if (!historyEntry) {
                    this.history.push(newHistoryEntry)
                }
            })

            RandomnessLogger.on('NumberReceived', (requestId: BigNumber, responseBlockNumber: BigNumber, responseTimestamp: BigNumber, randomNumber: BigNumber) => {
                
                for (const historyEntry of this.history) {

                    if (historyEntry.requestId.toString() === requestId.toString()) {
                        historyEntry.responseBlockNumber = responseBlockNumber
                        historyEntry.responseTimestamp = responseTimestamp
                        historyEntry.randomNumber = randomNumber

                        // only display the final confirmation if it was the user who requested the random number
                        if (this.requestMessages.length && this.responseMessages.length) {
                            this.isRequestFulfilled = true
                        }

                        break
                    }
                }
            })
        },

        getHistoryEntry (requestId: BigNumber): HistoryEntry | undefined {

            for (const historyEntry of this.history) {
                if (historyEntry.requestId.toString() === requestId.toString()) {

                    return historyEntry
                }
            }
        },

        async initAccount () {

            const accounts = await provider.send('eth_requestAccounts', [])
            this.accountAddress = accounts[0]
            signer = provider.getSigner()
            RandomnessLogger = RandomnessLogger.connect(signer)
        },

        async fetchHistory () {

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

                this.history.push(historyEntry)
            }
        },

        async requestRandomNumber () {

            this.requestMessages = []
            this.responseMessages = []
            this.isRequestFulfilled = false

            const transaction: ContractTransaction = await RandomnessLogger.requestRandomNumber()
            this.requestMessages.push(
                `Requested a random number`,
                `Transaction ${transaction.hash}`,
                `Waiting for the transaction to be mined...`,
            )
            const receipt = await transaction.wait()

            this.responseMessages.push(
                `Confirmed in block ${receipt.events![1].args!.blockNumber}`,
                `Request ID ${receipt.events![1].args!.requestId}`,
                `Chainlink VRF will fulfill it in about 3 blocks. Stay tuned...`,
            )
        },
    },

    async created () {

        await this.init()

        if (!this.isReadOnly) {
            window.ethereum.on('chainChanged', () => { this.init() })
            window.ethereum.on('accountsChanged', () => { this.initAccount() })
        }
    },
})

</script>

<template>
    <main>
        <section v-if="!errorMessage" class="top-orange">
            <img src="./images/batman.svg">
            <h2>Status</h2>
            <div v-if="isReadOnly">
                Web3 wallet not detected. The app is now working in read-only mode.<br/>
                To be able to request a random number, please install a web3 wallet such as MetaMask, or even better, use Brave browser.
            </div>
            <div v-else>Web3 wallet connected.<br/>Address {{ accountAddress }}</div>
        </section>
        
        <section v-if="!errorMessage" class="top-green">
            <img src="./images/pilot.svg">
            <h2>Random Numbers History</h2>
            <table>
                <thead>
                    <tr>
                        <th>Request ID</th>
                        <th>Request date</th>
                        <th>Response date</th>
                        <th>Request block</th>
                        <th>Response block</th>
                        <th>Requestor address</th>
                        <th>Random number</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="historyEntry in history">
                        <td>{{ historyEntry.requestId.toString().ellipsify(7, 3) }}</td>
                        <td>{{ historyEntry.requestTimestamp.toNumber().toDateString() }}</td>
                        <td>{{ historyEntry.responseTimestamp?.toNumber().toDateString() ?? '' }}</td>
                        <td>{{ historyEntry.requestBlockNumber.toString().padEnd(8) }}</td>
                        <td>{{ historyEntry.responseBlockNumber?.toString().padEnd(8) ?? '' }}</td>
                        <td>{{ historyEntry.requestorAddress.ellipsify(8, 3) }}</td>
                        <td>{{ historyEntry.randomNumber?.toString().ellipsify(7, 3) ?? '' }}</td>
                    </tr>
                </tbody>
            </table>

        </section>

        <section v-if="!errorMessage" class="top-red">
            <img src="./images/santa.svg">
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

        <section v-if="errorMessage" class="top-gray">
            <img src="./images/sloth.svg">
            <h2>Error</h2>
            <div>{{ errorMessage }}</div>
        </section>
    </main>
</template>

<style>

@import './custom.css';

</style>
