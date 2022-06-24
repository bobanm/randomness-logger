<script lang="ts">

import { defineComponent } from 'vue'
import { ethers, Contract, BigNumber, providers } from 'ethers'
import { CONTRACT_ADDRESS, CONTRACT_ABI, CONTRACT_BLOCK_DEPLOYED } from '../../../app.config'
import './globals'

type HistoryEntry = {
    requestBlockNumber: number,
    requestTimestamp: BigNumber,
    requestId: BigNumber,
    requestorAddress: string,
    responseBlockNumber?: number,
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
        }
    },

    methods: {

        async init () {

            this.history = []
            this.errorMessage = ''

            provider = new ethers.providers.Web3Provider(window.ethereum)
            const providerNetwork = await provider.getNetwork()

            if (providerNetwork.chainId !== 4) {
                this.errorMessage = 'The smart contract is currently deployed only on Rinkeby network. Please switch your wallet to Rinkeby.'

                return
            }

            RandomnessLogger = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)

            await this.initAccount()
            await this.fetchHistory()
        },

        async initAccount () {

            const accounts = await provider.send('eth_requestAccounts', [])
            this.accountAddress = accounts[0]
            signer = provider.getSigner()
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
                    requestBlockNumber: requestsLogEntry.blockNumber,
                    requestTimestamp: requestsLogEntry.args!.timestamp,
                    requestId: requestsLogEntry.args!.requestId,
                    requestorAddress: requestsLogEntry.args!.requestorAddress,
                }
                
                // search through responses log array, match with requests array on requestId and assign missing values
                for (const responsesLogEntry of responsesLog) {

                    if (responsesLogEntry.args!.requestId.toString() === requestsLogEntry.args!.requestId.toString()) {
                        historyEntry.responseBlockNumber = responsesLogEntry.blockNumber
                        historyEntry.responseTimestamp = responsesLogEntry.args!.timestamp
                        historyEntry.randomNumber = responsesLogEntry.args!.randomNumber

                        break
                    }
                }

                this.history.push(historyEntry)
            }
        },
    },

    async created () {

        if (!window.ethereum) {
            this.errorMessage = 'MetaMask not detected. Please install MetaMask and refresh the page.'

            return
        }

        await this.init()

        window.ethereum.on('chainChanged', () => { this.init() })
        window.ethereum.on('accountsChanged', () => { this.initAccount() })
    },
})

</script>

<template>
    <main>
        <section v-if="!errorMessage" class="top-orange">
            <img src="./images/batman.svg">
            <h2>Status</h2>
            Account address {{ accountAddress }}
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
                        <td>{{ new Date(historyEntry.requestTimestamp.toNumber() * 1000).toNiceString() }}</td>
                        <td>{{ historyEntry.responseTimestamp ? new Date(historyEntry.responseTimestamp.toNumber() * 1000).toNiceString() : ''.padEnd(19)}}</td>
                        <td>{{ historyEntry.requestBlockNumber.toString().padEnd(8) }}</td>
                        <td>{{ historyEntry.responseBlockNumber?.toString().padEnd(8) ?? ''.padEnd(8) }}</td>
                        <td>{{ historyEntry.requestorAddress.ellipsify(8, 3) }}</td>
                        <td>{{ historyEntry.randomNumber?.toString().ellipsify(7, 3) ?? '' }}</td>
                    </tr>
                </tbody>
            </table>

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
