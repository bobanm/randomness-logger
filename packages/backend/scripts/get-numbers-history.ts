import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'

import '../utils/prototypes'

const { CONTRACT_ADDRESS, CONTRACT_NAME, CONTRACT_BLOCK_DEPLOYED } = require('../app.config')

type HistoryEntry = {
    requestBlockNumber: number,
    requestTimestamp: BigNumber,
    requestId: BigNumber,
    requestorAddress: string,
    responseBlockNumber?: number,
    responseTimestamp?: BigNumber,
    randomNumber?: BigNumber,
}

async function main () {

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

        history.push(historyEntry)
    }

    console.log('REQUEST ID      REQUEST DATE          RESPONSE DATE         REQ BLK    RESP BLK   REQUESTOR ADDR   RANDOM NUMBER')
    console.log('-'.repeat(112))

    for (const historyEntry of history) {
        const requestId = historyEntry.requestId.toString().ellipsify(7, 3)
        const requestDate = new Date(historyEntry.requestTimestamp.toNumber() * 1000).toNiceString()
        const responseDate = historyEntry.responseTimestamp ? new Date(historyEntry.responseTimestamp.toNumber() * 1000).toNiceString() : ''.padEnd(19)
        const requestBlockNumber = historyEntry.requestBlockNumber.toString().padEnd(8)
        const responseBlockNumber = historyEntry.responseBlockNumber?.toString().padEnd(8) ?? ''.padEnd(8)
        const requestorAddress = historyEntry.requestorAddress.ellipsify(8, 3)
        const randomNumber = historyEntry.randomNumber?.toString().ellipsify(7, 3) ?? ''
        
        console.log(`${requestId}   ${requestDate}   ${responseDate}   ${requestBlockNumber}   ${responseBlockNumber}   ${requestorAddress}   ${randomNumber}`)
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })