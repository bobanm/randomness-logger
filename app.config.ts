// all network-specific values are for Sepolia testnet
export const CONTRACT_NAME = 'RandomnessLogger'
export const CONTRACT_ADDRESS = '0x07F4F9173866c2b2F59605ff4119d9a553545A98'
export const CONTRACT_ABI = [
    'event NumberRequested(uint requestId, uint blockNumber, uint timestamp, address indexed requestorAddress)',
    'event NumberReceived(uint requestId, uint blockNumber, uint timestamp, uint randomNumber)',
    'function requestRandomNumber () external',
]
export const CONTRACT_BLOCK_DEPLOYED = 5772648

export enum Network {
    NAME = 'sepolia',
    ID = 11155111,
}

export const VRF_SUBSCRIPTION_ID = 11405
export const VRF_CONTRACT_ADDRESS = '0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625'
export const VRF_CONTRACT_ABI = [
    'function getSubscription(uint64 subId) external view returns (uint96 balance, uint64 reqCount, address owner, address[] memory consumers)',
]
