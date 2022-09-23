import '@nomiclabs/hardhat-waffle'
import '@nomiclabs/hardhat-etherscan'
import { HardhatUserConfig } from 'hardhat/config'

import './tasks'
import { ALCHEMY_API_KEY, PRIVATE_KEYS, ETHERSCAN_API_KEY } from './.credentials'

const config: HardhatUserConfig = {
    solidity: '0.8.17',
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },

    networks: {
        goerli: {
            url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
            accounts: PRIVATE_KEYS,
        },
        'optimism-goerli': {
            url: 'https://goerli.optimism.io',
            accounts: PRIVATE_KEYS,
        },
        'arbitrum-goerli': {
            url: 'https://goerli-rollup.arbitrum.io/rpc/',
            accounts: PRIVATE_KEYS,
        },
    }
}

export default config