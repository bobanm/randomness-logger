export declare global {
    interface Window {
        ethereum: any
    }

    interface String {
        ellipsify (startLength: number, endLength: number): string
    }

    interface Number {
        toDateString (): string
    }

    interface Date {
        toNiceString (): string
    }

    type HistoryEntry = {
        requestId: BigNumber,
        requestBlockNumber: BigNumber,
        requestTimestamp: BigNumber,
        requestorAddress: string,
        responseBlockNumber?: BigNumber,
        responseTimestamp?: BigNumber,
        randomNumber?: BigNumber,
    }
}