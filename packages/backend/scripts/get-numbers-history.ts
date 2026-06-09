import hre from 'hardhat'

import '../utils/prototypes'
import { CONTRACT_ADDRESS, CONTRACT_NAME, CONTRACT_BLOCK_DEPLOYED } from '../../../app.config'

type HistoryEntry = {
    requestBlockNumber: bigint,
    requestTimestamp: bigint,
    requestId: bigint,
    requestorAddress: string,
    responseBlockNumber?: bigint,
    responseTimestamp?: bigint,
    randomNumber?: bigint,
}

const { ethers } = await hre.network.create()

const RandomnessLogger = await ethers.getContractAt(CONTRACT_NAME, CONTRACT_ADDRESS)

const history: HistoryEntry[] = []
const filterRequests = RandomnessLogger.filters.NumberRequested()
const filterResponses = RandomnessLogger.filters.NumberReceived()

console.log('\nQuerying the blockchain, please wait...\n')

const [requestsLog, responsesLog] = await Promise.all([
    RandomnessLogger.queryFilter(filterRequests, CONTRACT_BLOCK_DEPLOYED),
    RandomnessLogger.queryFilter(filterResponses, CONTRACT_BLOCK_DEPLOYED),
])

for (const requestsLogEntry of requestsLog) {
    if (!('args' in requestsLogEntry)) continue
    const { args: reqArgs } = requestsLogEntry

    const historyEntry: HistoryEntry = {
        requestBlockNumber: reqArgs.blockNumber,
        requestTimestamp: reqArgs.timestamp,
        requestId: reqArgs.requestId,
        requestorAddress: reqArgs.requestorAddress,
    }

    for (const responsesLogEntry of responsesLog) {
        if (!('args' in responsesLogEntry)) continue
        const { args: resArgs } = responsesLogEntry

        if (resArgs.requestId.toString() === reqArgs.requestId.toString()) {
            historyEntry.responseBlockNumber = resArgs.blockNumber
            historyEntry.responseTimestamp = resArgs.timestamp
            historyEntry.randomNumber = resArgs.randomNumber

            break
        }
    }

    history.push(historyEntry)
}

console.log('REQUEST ID      REQUEST DATE          RESPONSE DATE         REQ BLK    RESP BLK   REQUESTOR ADDR   RANDOM NUMBER')
console.log('-'.repeat(112))

for (const historyEntry of history) {
    const requestId = historyEntry.requestId.toString().ellipsify(7, 3)
    const requestDate = new Date(Number(historyEntry.requestTimestamp) * 1000).toNiceString()
    const responseDate = historyEntry.responseTimestamp ? new Date(Number(historyEntry.responseTimestamp) * 1000).toNiceString() : ''.padEnd(19)
    const requestBlockNumber = historyEntry.requestBlockNumber.toString().padEnd(8)
    const responseBlockNumber = historyEntry.responseBlockNumber?.toString().padEnd(8) ?? ''.padEnd(8)
    const requestorAddress = historyEntry.requestorAddress.ellipsify(8, 3)
    const randomNumber = historyEntry.randomNumber?.toString().ellipsify(7, 3) ?? ''

    console.log(`${requestId}   ${requestDate}   ${responseDate}   ${requestBlockNumber}   ${responseBlockNumber}   ${requestorAddress}   ${randomNumber}`)
}
