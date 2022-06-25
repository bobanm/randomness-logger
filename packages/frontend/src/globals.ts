String.prototype.ellipsify = function (startLength, endLength) {

    if (startLength + endLength >= this.length) {

        return String(this)
    }

    return (this.substring(0, startLength) + '...' + this.substring(this.length - endLength))
}

Number.prototype.toDateString = function () {

    return (new Date(Number(this) * 1000)).toNiceString()
}

Date.prototype.toNiceString = function () {

    const YYYY = this.getFullYear().toString()
    const MM = (this.getMonth() + 1).toString().padStart(2, '0')
    const DD = this.getDate().toString().padStart(2, '0')
    const time = this.toTimeString().substring(0, 8)
        
    return `${YYYY}-${MM}-${DD} ${time}`
}

export {}