import hre from 'hardhat'
import { TablePrinter } from '@bobanm/table-printer'
import '@randomness-logger/shared'
import { CONTRACT_ADDRESS, CONTRACT_NAME, CONTRACT_BLOCK_DEPLOYED } from '../../../config/app.config'

const { ethers } = await hre.network.create()

const RandomnessLogger = await ethers.getContractAt(CONTRACT_NAME, CONTRACT_ADDRESS)

const filterRequests = RandomnessLogger.filters.NumberRequested()
const filterResponses = RandomnessLogger.filters.NumberReceived()

const historyTable = new TablePrinter(
    [['REQUEST ID', 'REQUEST DATE', 'RESPONSE DATE', 'REQ BLK', 'RESP BLK', 'REQUESTOR ADDR', 'RANDOM NUMBER']],
    {
        rightAlignedColumns: [3, 4],
        repeatHeaderAtBottom: true,
    }
)

console.log('\nQuerying the blockchain, please wait...\n')

const [requestsLog, responsesLog] = await Promise.all([
    RandomnessLogger.queryFilter(filterRequests, CONTRACT_BLOCK_DEPLOYED),
    RandomnessLogger.queryFilter(filterResponses, CONTRACT_BLOCK_DEPLOYED),
])

// search through responses log array, match with requests array on requestId
for (const responsesLogEntry of responsesLog) {
    for (const requestsLogEntry of requestsLog) {
        if (responsesLogEntry.args.requestId === requestsLogEntry.args.requestId) {

            historyTable.addRow([
                requestsLogEntry.args.requestId.toString().ellipsify(7, 3),
                new Date(Number(requestsLogEntry.args.timestamp) * 1000).toNiceString(),
                new Date(Number(responsesLogEntry.args.timestamp) * 1000).toNiceString(),
                requestsLogEntry.args.blockNumber,
                responsesLogEntry.args.blockNumber,
                requestsLogEntry.args.requestorAddress.ellipsify(8, 3),
                responsesLogEntry.args.randomNumber.toString().ellipsify(9, 3),
            ])

            break
        }
    }
}

console.log(historyTable.toString())
