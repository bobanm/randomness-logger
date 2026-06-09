import { task } from 'hardhat/config'

export const balance = task('balance', 'Prints an account balance')
    .addOption({ name: 'address', description: 'The account address', defaultValue: '' })
    .setInlineAction(async (args, hre) => {
        if (!args.address) {
            console.error('Error: --address is required')
            return
        }
        const { ethers } = await hre.network.create()
        const balance = await ethers.provider.getBalance(args.address)
        console.log(`${args.address} = ${ethers.formatEther(balance)} ETH`)
    })
    .build()

export const balances = task('balances', 'Prints balances of all configured accounts')
    .setInlineAction(async (args, hre) => {
        const { ethers } = await hre.network.create()
        const signers = await ethers.getSigners()

        if (!signers.length) {
            console.log('No accounts detected. Configure them in your Hardhat config file.')

            return
        }

        console.log(
            `${signers.length} accounts configured\n\n` +
            'ACCOUNT                                      BALANCE ETH\n' +
            '-----------------------------------------------------------------'
        )
        for (const signer of signers) {
            const address = await signer.getAddress()
            const balance = await ethers.provider.getBalance(address)
            console.log(`${address}   ${ethers.formatEther(balance)}`)
        }
    })
    .build()

export const send = task('send', 'Sends ETH from the primary account to another account')
    .addOption({ name: 'address', description: 'Address of the receiver', defaultValue: '' })
    .addOption({ name: 'amount', description: 'Amount in ETH', defaultValue: '' })
    .setInlineAction(async (args, hre) => {
        if (!args.address || !args.amount) {
            console.error('Error: --address and --amount are required')
            return
        }
        const { ethers } = await hre.network.create()
        const [signer] = await ethers.getSigners()

        if (!signer) {
            console.log('No accounts configured.')
            return
        }

        const transactionSend = await signer.sendTransaction({
            to: args.address,
            value: ethers.parseEther(String(args.amount))
        })
        console.log(`transaction hash: ${transactionSend.hash}`)
        const receiptSend = await transactionSend.wait()
        console.log(`mined in block: ${receiptSend?.blockNumber}`)
    })
    .build()

export const deploy = task('deploy', 'Deploy a contract')
    .addOption({ name: 'contract', description: 'Contract name', defaultValue: '' })
    .setInlineAction(async (args, hre) => {
        if (!args.contract) {
            console.error('Error: --contract is required')
            return
        }
        const { ethers } = await hre.network.create()
        const contractFactory = await ethers.getContractFactory(args.contract)
        const contract = await contractFactory.deploy()

        const address = await contract.getAddress()
        const tx = contract.deploymentTransaction()

        console.log(`Deploying contract ${address}\n` +
            `Transaction ${tx?.hash}\n`)
        await contract.waitForDeployment()

        console.log('Contract successfully deployed')
    })
    .build()
