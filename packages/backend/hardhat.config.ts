import '@nomiclabs/hardhat-waffle'
import '@nomiclabs/hardhat-etherscan'
import { HardhatUserConfig } from 'hardhat/config'

import './tasks'
import { ALCHEMY_API_KEY, PRIVATE_KEYS, ETHERSCAN_API_KEY } from './.credentials'

const config: HardhatUserConfig = {
    solidity: '0.8.24',
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },

    networks: {
        sepolia: {
            url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
            accounts: PRIVATE_KEYS,
        },
        'optimism-sepolia': {
            url: 'https://sepolia.optimism.io',
            accounts: PRIVATE_KEYS,
        },
        'arbitrum-sepolia': {
            url: 'https://sepolia-rollup.arbitrum.io/rpc/',
            accounts: PRIVATE_KEYS,
        },
    }
}

export default config