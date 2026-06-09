export type HistoryEntry = {
    requestId: bigint
    requestBlockNumber: bigint
    requestTimestamp: bigint
    requestorAddress: string
    responseBlockNumber?: bigint
    responseTimestamp?: bigint
    randomNumber?: bigint
}
