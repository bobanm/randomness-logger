// all network-specific values are for Rinkeby testnet
export const CONTRACT_ADDRESS = '0x03c9c44378CE78e7D30ae90645024d0212e269B5'
export const CONTRACT_ABI = [
    'event NumberRequested(uint requestId, uint timestamp, address indexed requestorAddress)',
    'event NumberReceived(uint requestId, uint timestamp, uint randomNumber)',
    'function requestRandomNumbers (uint32 callbackGasLimit) external',
]
export const CONTRACT_BLOCK_DEPLOYED = 10869587