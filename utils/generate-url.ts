export function generateInfuraUrl (networkName: string, apiKey: string): string {

    return `https://${networkName}.infura.io/v3/${apiKey}`
}

export function generateAlchemyUrl (networkName: string, apiKey: string): string {

    return `https://eth-${networkName}.alchemyapi.io/v2/${apiKey}`
}
