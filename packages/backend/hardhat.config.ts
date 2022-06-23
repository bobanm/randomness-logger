import '@nomiclabs/hardhat-waffle'
import '@nomiclabs/hardhat-etherscan'
import { HardhatUserConfig } from 'hardhat/config'

import './tasks'
import { generateInfuraUrl, generateAlchemyUrl } from './utils/generate-url'
import { ALCHEMY_API_KEY, INFURA_API_KEY, PRIVATE_KEYS, ETHERSCAN_API_KEY } from './.credentials'

const config: HardhatUserConfig = {
    solidity: '0.8.9',
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },

    networks: {
        mainnet: {
            url: generateAlchemyUrl('mainnet', ALCHEMY_API_KEY),
        },
        optimism: {
            url: 'https://mainnet.optimism.io',
        },
        arbitrum: {
            url: 'https://arb1.arbitrum.io/rpc',
        },
        ropsten: {
            url: generateAlchemyUrl('ropsten', ALCHEMY_API_KEY),
            accounts: PRIVATE_KEYS,
        },
        rinkeby: {
            url: generateInfuraUrl('rinkeby', INFURA_API_KEY),
            accounts: PRIVATE_KEYS,
        },
        goerli: {
            url: generateAlchemyUrl('goerli', ALCHEMY_API_KEY),
            accounts: PRIVATE_KEYS,
        },
        kovan: {
            url: generateInfuraUrl('kovan', INFURA_API_KEY),
            accounts: PRIVATE_KEYS,
        },
        'optimism-kovan': {
            url: 'https://kovan.optimism.io',
            accounts: PRIVATE_KEYS,
        },
        'arbitrum-rinkeby': {
            url: 'https://rinkeby.arbitrum.io/rpc',
            accounts: PRIVATE_KEYS,
        },
        'bsc-test': {
            url: 'https://data-seed-prebsc-1-s3.binance.org:8545',
            accounts: PRIVATE_KEYS,
        },
        'polygon-mumbai': {
            url: 'https://matic-mumbai.chainstacklabs.com',
            accounts: PRIVATE_KEYS,
        },
        'avalanche-fuji': {
            url: 'https://api.avax-test.network/ext/bc/C/rpc',
            accounts: PRIVATE_KEYS,
        },
    }
}

export default config