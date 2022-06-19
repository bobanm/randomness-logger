const { ethers } = require('hardhat')

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

        const requestBlockNumber = requestsLogEntry.blockNumber
        const requestTimestamp = parsedRequestsLogEntry.args.timestamp
        const requestId = parsedRequestsLogEntry.args.requestId
        const requestorAddress = parsedRequestsLogEntry.args.requestorAddress
        let responseBlockNumber, responseTimestamp, randomNumber

        // search through responses log array, parse it, match with requests array on requestId and assign values
        for (const responsesLogEntry of responsesLog) {
            const parsedResponsesLogEntry = RandomnessLogger.interface.parseLog(responsesLogEntry)

            if (parsedResponsesLogEntry.args.requestId.toString() === parsedRequestsLogEntry.args.requestId.toString()) {
                responseBlockNumber = responsesLogEntry.blockNumber
                responseTimestamp = parsedResponsesLogEntry.args.timestamp
                randomNumber = parsedResponsesLogEntry.args.randomNumber

                break
            }
        }

        history.push({
            requestBlockNumber,
            requestTimestamp,
            requestId,
            requestorAddress,
            responseBlockNumber,
            responseTimestamp,
            randomNumber,
        })
    }

    console.log('REQUEST ID      REQUEST DATE          RESPONSE DATE         REQ BLK    RESP BLK   REQUESTOR ADDR   RANDOM NUMBER')
    console.log('-'.repeat(112))

    for (const historyEntry of history) {
        const requestId = historyEntry.requestId.toString().ellipsis(7, 3)
        const requestDate = new Date(historyEntry.requestTimestamp * 1000).formatUtc()
        const responseDate = historyEntry.responseTimestamp ? new Date(historyEntry.responseTimestamp * 1000).formatUtc() : ''.padEnd(19)
        const requestBlockNumber = historyEntry.requestBlockNumber.toString().padEnd(8)
        const responseBlockNumber = historyEntry.responseBlockNumber?.toString().padEnd(8) ?? ''.padEnd(8)
        const requestorAddress = historyEntry.requestorAddress.ellipsis(8, 3)
        const randomNumber = historyEntry.randomNumber?.toString().ellipsis(7, 3) ?? ''
        
        console.log(`${requestId}   ${requestDate}   ${responseDate}   ${requestBlockNumber}   ${responseBlockNumber}   ${requestorAddress}   ${randomNumber}`)
    }
}

String.prototype.ellipsis = function (startLength, endLength) {

    if (startLength + endLength >= this.length) {

        return String(this)
    }

    return (this.substring(0, startLength) + '...' + this.substring(this.length - endLength))
}

Date.prototype.formatUtc = function () {
    
    return this.toISOString().slice(0, 19).replace('T', ' ')
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })