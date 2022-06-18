require('@nomiclabs/hardhat-waffle')
require('@nomiclabs/hardhat-etherscan')

const { generateInfuraUrl, generateAlchemyUrl } = require('./utils/generate-url')
const { ALCHEMY_API_KEY, INFURA_API_KEY, PRIVATE_KEYS, ETHERSCAN_API_KEY } = require('./.credentials')

task('balance', 'Prints an account balance')
    .addParam('address', 'The account address')
    .setAction(async (args) => {
        const balance = await ethers.provider.getBalance(args.address)
        console.log(`${args.address} = ${ethers.utils.formatEther(balance)} ETH`)
    })

task('balances', 'Prints balances of all configured accounts')
    .setAction(async () => {
        const accounts = await ethers.getSigners()

        if (!accounts.length) {
            console.log('No accounts detected. Configure them in your Hardhat config file.')

            return
        }

        console.log(
            `${accounts.length} accounts configured\n\n` +
            'ACCOUNT                                      BALANCE ETH\n' +
            '-----------------------------------------------------------------'
        )
        for (const account of accounts) {
            const balance = await ethers.provider.getBalance(account.address)
            console.log(`${account.address}   ${ethers.utils.formatEther(balance)}`)
        }
    })

task('deploy', 'Deploy a contract')
    .addParam('contract', 'Contract name')
    .setAction(async (args) => {
        const contractFactory = await ethers.getContractFactory(args.contract)
        const contract = await contractFactory.deploy()
    
        console.log(`Deploying contract ${contract.address}\n` +
            `Transaction ${contract.deployTransaction.hash}\n`)
        await contract.deployed()
    
        console.log('Contract successfully deployed');
    })

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
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
