// all network-specific values are for Rinkeby testnet

module.exports = {
    CONTRACT_NAME: 'RandomnessLogger',
    CONTRACT_ADDRESS: '0x03c9c44378CE78e7D30ae90645024d0212e269B5',
    CONTRACT_BLOCK_DEPLOYED: 10869587,
    
    VRF_CONTRACT_ADDRESS: '0x6168499c0cFfCaCD319c818142124B7A15E857ab',
    VRF_CONTRACT_ABI: [
        'function getSubscription(uint64 subId) external view returns (uint96 balance, uint64 reqCount, address owner, address[] memory consumers)',
    ],
    VRF_SUBSCRIPTION_ID: 5853,
    CALLBACK_GAS_LIMIT: 100000,
}