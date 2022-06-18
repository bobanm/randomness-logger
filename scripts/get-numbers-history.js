const { ethers } = require('hardhat')

const { CONTRACT_ADDRESS, CONTRACT_NAME, CONTRACT_BLOCK_DEPLOYED } = require('../app.config')

async function main () {

    const RandomnessLogger = await ethers.getContractAt(CONTRACT_NAME, CONTRACT_ADDRESS)

    const requests = []
    const filter = RandomnessLogger.filters.NumberRequested()
    filter.fromBlock = CONTRACT_BLOCK_DEPLOYED
    // filter.fromBlock = config.networks.hardhat.forking.blockNumber
    const logs = await ethers.provider.getLogs(filter)

    for (const log of logs) {
        const parsedLog = RandomnessLogger.interface.parseLog(log)
        requests.push({
            blockNumber: log.blockNumber,
            date: (new Date(parsedLog.args.timestamp.toNumber() * 1000)).toISOString().slice(0, 19).replace('T', ' '),
            requestId: parsedLog.args.requestId.toString(),
            requestorAddress: parsedLog.args.requestorAddress,
        })
    }

    console.log('REQUESTS')
    console.log(requests)

    const responses = []
    const filterResponse = RandomnessLogger.filters.NumberReceived()
    filterResponse.fromBlock = CONTRACT_BLOCK_DEPLOYED
    const logsResponse = await ethers.provider.getLogs(filterResponse)

    for (const log of logsResponse) {
        const parsedLog = RandomnessLogger.interface.parseLog(log)
        responses.push({
            blockNumber: log.blockNumber,
            date: (new Date(parsedLog.args.timestamp.toNumber() * 1000)).toISOString().slice(0, 19).replace('T', ' '),
            requestId: parsedLog.args.requestId.toString(),
            randomNumber: parsedLog.args.randomNumber.toString(),
        })
    }

    console.log('RESPONSES')
    console.log(responses)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })