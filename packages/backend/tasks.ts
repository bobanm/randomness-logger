import { task } from 'hardhat/config'

task('balance', 'Prints an account balance')
    .addParam('address', 'The account address')
    .setAction(async (args, hre) => {
        const balance = await hre.ethers.provider.getBalance(args.address)
        console.log(`${args.address} = ${hre.ethers.utils.formatEther(balance)} ETH`)
    })

task('balances', 'Prints balances of all configured accounts')
    .setAction(async (args, hre) => {
        const accounts = await hre.ethers.getSigners()

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
            const balance = await hre.ethers.provider.getBalance(account.address)
            console.log(`${account.address}   ${hre.ethers.utils.formatEther(balance)}`)
        }
    })

task('send', 'Sends ETH from the primary account to another account')
    .addParam('address', 'Address of the receiver')
    .addParam('amount', 'Amount in ETH')
    .setAction(async (args, hre) => {

        const signer = hre.ethers.provider.getSigner()

        const transactionSend = await signer.sendTransaction({
            to: args.address,
            value: hre.ethers.utils.parseEther(String(args.amount))
        })
        console.log(`transaction hash: ${transactionSend.hash}`)
        const receiptSend = await transactionSend.wait()
        console.log(`mined in block: ${receiptSend.blockNumber}`)
    })

task('deploy', 'Deploy a contract')
    .addParam('contract', 'Contract name')
    .setAction(async (args, hre) => {
        const contractFactory = await hre.ethers.getContractFactory(args.contract)
        const contract = await contractFactory.deploy()
    
        console.log(`Deploying contract ${contract.address}\n` +
            `Transaction ${contract.deployTransaction.hash}\n`)
        await contract.deployed()
    
        console.log('Contract successfully deployed');
    })
