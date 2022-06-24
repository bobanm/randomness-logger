// all network-specific values are for Rinkeby testnet
export const CONTRACT_NAME = 'RandomnessLogger'
export const CONTRACT_ADDRESS = '0x03c9c44378CE78e7D30ae90645024d0212e269B5'
export const CONTRACT_ABI = [
    'event NumberRequested(uint requestId, uint timestamp, address indexed requestorAddress)',
    'event NumberReceived(uint requestId, uint timestamp, uint randomNumber)',
    'function requestRandomNumbers (uint32 callbackGasLimit) external',
]
export const CONTRACT_BLOCK_DEPLOYED = 10869587

export const CALLBACK_GAS_LIMIT = 100000

export const VRF_SUBSCRIPTION_ID = 5853
export const VRF_CONTRACT_ADDRESS = '0x6168499c0cFfCaCD319c818142124B7A15E857ab'
export const VRF_CONTRACT_ABI = [
    'function getSubscription(uint64 subId) external view returns (uint96 balance, uint64 reqCount, address owner, address[] memory consumers)',
]
