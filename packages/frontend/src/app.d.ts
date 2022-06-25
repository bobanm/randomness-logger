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
}