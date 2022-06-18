const { ethers } = require('hardhat')

const CONTRACT_ADDRESS = '0x03c9c44378CE78e7D30ae90645024d0212e269B5' // rinkeby
const CONTRACT_NAME = 'RandomnessLogger'
const CONTRACT_BLOCK_DEPLOYED = 10869587

async function main () {

    const contract = await ethers.getContractAt(CONTRACT_NAME, CONTRACT_ADDRESS)

    const requests = []
    const filter = contract.filters.NumberRequested()
    filter.fromBlock = CONTRACT_BLOCK_DEPLOYED
    // filter.fromBlock = config.networks.hardhat.forking.blockNumber
    const logs = await ethers.provider.getLogs(filter)

    for (const log of logs) {
        const parsedLog = contract.interface.parseLog(log)
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
    const filterResponse = contract.filters.NumberReceived()
    filterResponse.fromBlock = CONTRACT_BLOCK_DEPLOYED
    const logsResponse = await ethers.provider.getLogs(filterResponse)

    for (const log of logsResponse) {
        const parsedLog = contract.interface.parseLog(log)
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