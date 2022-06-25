// all network-specific values are for Rinkeby testnet
export const CONTRACT_NAME = 'RandomnessLogger'
export const CONTRACT_ADDRESS = '0x1f101039eb1775dfb8b5014c21a6d67feff9d681'
export const CONTRACT_ABI = [
    'event NumberRequested(uint requestId, uint blockNumber, uint timestamp, address indexed requestorAddress)',
    'event NumberReceived(uint requestId, uint blockNumber, uint timestamp, uint randomNumber)',
    'function requestRandomNumber () external',
]
export const CONTRACT_BLOCK_DEPLOYED = 10915655

export const VRF_SUBSCRIPTION_ID = 5853
export const VRF_CONTRACT_ADDRESS = '0x6168499c0cFfCaCD319c818142124B7A15E857ab'
export const VRF_CONTRACT_ABI = [
    'function getSubscription(uint64 subId) external view returns (uint96 balance, uint64 reqCount, address owner, address[] memory consumers)',
]
