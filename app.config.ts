// all network-specific values are for Goerli testnet
export const CONTRACT_NAME = 'RandomnessLogger'
export const CONTRACT_ADDRESS = '0x2858f6B704B7ffbAA152be2E6C9805d330d1B20D'
export const CONTRACT_ABI = [
    'event NumberRequested(uint requestId, uint blockNumber, uint timestamp, address indexed requestorAddress)',
    'event NumberReceived(uint requestId, uint blockNumber, uint timestamp, uint randomNumber)',
    'function requestRandomNumber () external',
]
export const CONTRACT_BLOCK_DEPLOYED = 7645103
export const DEFAULT_NETWORK = 'goerli'

export const VRF_SUBSCRIPTION_ID = 2260
export const VRF_CONTRACT_ADDRESS = '0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D'
export const VRF_CONTRACT_ABI = [
    'function getSubscription(uint64 subId) external view returns (uint96 balance, uint64 reqCount, address owner, address[] memory consumers)',
]
