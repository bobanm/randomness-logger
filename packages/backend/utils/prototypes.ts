declare global {
    interface String {
        ellipsify(startLength: number, endLength: number): string
    }
    interface Date {
        toNiceString(): string
    }
}

String.prototype.ellipsify = function (this: string, startLength: number, endLength: number): string {
    if (startLength + endLength >= this.length) {
        return this
    }
    return this.substring(0, startLength) + '...' + this.substring(this.length - endLength)
}

Date.prototype.toNiceString = function (this: Date): string {
    const YYYY = this.getFullYear().toString()
    const MM = (this.getMonth() + 1).toString().padStart(2, '0')
    const DD = this.getDate().toString().padStart(2, '0')
    const time = this.toTimeString().substring(0, 8)
    return `${YYYY}-${MM}-${DD} ${time}`
}

export {}
