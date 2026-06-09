import { defineConfig, configVariable } from 'hardhat/config'
import hardhatToolboxMochaEthers from '@nomicfoundation/hardhat-toolbox-mocha-ethers'
import hardhatVerify from '@nomicfoundation/hardhat-verify'
import { balance, balances, send, deploy } from './tasks'

export default defineConfig({
    plugins: [hardhatToolboxMochaEthers, hardhatVerify],
    solidity: '0.8.35',
    networks: {
        hardhatMainnet: {
            type: 'edr-simulated',
            chainType: 'l1',
        },
        sepolia: {
            type: 'http',
            chainType: 'l1',
            url: configVariable('SEPOLIA_RPC_URL'),
            accounts: [configVariable('PRIVATE_KEY')],
        },
    },
    verify: {
        etherscan: {
            apiKey: configVariable('ETHERSCAN_API_KEY'),
        },
    },
    tasks: [balance, balances, send, deploy],
})
