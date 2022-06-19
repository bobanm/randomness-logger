const { ethers } = require('hardhat')
require('../utils/prototypes')

const { CONTRACT_ADDRESS, CONTRACT_NAME, CONTRACT_BLOCK_DEPLOYED } = require('../app.config')

async function main () {

    const RandomnessLogger = await ethers.getContractAt(CONTRACT_NAME, CONTRACT_ADDRESS)

    const history = []
    const filterRequests = RandomnessLogger.filters.NumberRequested()
    const filterResponses = RandomnessLogger.filters.NumberReceived()
    filterRequests.fromBlock = CONTRACT_BLOCK_DEPLOYED
    filterResponses.fromBlock = CONTRACT_BLOCK_DEPLOYED
    
    console.log('\nQuerying the blockchain, please wait...\n')

    const [requestsLog, responsesLog] = await Promise.all([
        ethers.provider.getLogs(filterRequests),
        ethers.provider.getLogs(filterResponses),
    ])

    // loop through requests log array, parse it and combine with responses array
    for (const requestsLogEntry of requestsLog) {
        const parsedRequestsLogEntry = RandomnessLogger.interface.parseLog(requestsLogEntry)

        const historyEntry = {
            requestBlockNumber: requestsLogEntry.blockNumber,
            requestTimestamp: parsedRequestsLogEntry.args.timestamp,
            requestId: parsedRequestsLogEntry.args.requestId,
            requestorAddress: parsedRequestsLogEntry.args.requestorAddress,
        }
        
        let responseBlockNumber, responseTimestamp, randomNumber

        // search through responses log array, parse it, match with requests array on requestId and assign values
        for (const responsesLogEntry of responsesLog) {
            const parsedResponsesLogEntry = RandomnessLogger.interface.parseLog(responsesLogEntry)

            if (parsedResponsesLogEntry.args.requestId.toString() === parsedRequestsLogEntry.args.requestId.toString()) {
                historyEntry.responseBlockNumber = responsesLogEntry.blockNumber
                historyEntry.responseTimestamp = parsedResponsesLogEntry.args.timestamp
                historyEntry.randomNumber = parsedResponsesLogEntry.args.randomNumber

                break
            }
        }

        history.push(historyEntry)
    }

    console.log('REQUEST ID      REQUEST DATE          RESPONSE DATE         REQ BLK    RESP BLK   REQUESTOR ADDR   RANDOM NUMBER')
    console.log('-'.repeat(112))

    for (const historyEntry of history) {
        const requestId = historyEntry.requestId.toString().ellipsify(7, 3)
        const requestDate = new Date(historyEntry.requestTimestamp * 1000).toNiceString()
        const responseDate = historyEntry.responseTimestamp ? new Date(historyEntry.responseTimestamp * 1000).toNiceString() : ''.padEnd(19)
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