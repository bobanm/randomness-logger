![2022-07-10 00_05_14](https://user-images.githubusercontent.com/2560022/178125279-4620a6f3-e5dd-48b0-924c-71a2761d21b8.png)

What is this all about?
-----------------------

This is a demo of Chainlink VRF v2 oracle. The app alows a user to browse all the random numbers
previously obtained using its smart contract. If connected to Rinkeby test network, a user can also
request a new random number from the oracle.

The demo consists of 2 packages:

1. `backend`, which defines the smart contract and its interaction with Chainlink oracle
1. `frontend`, which reads random numbers history and allows a user to request a new random number

The history of obtained random numbers is not stored in the contract state. Once obtained, the
contract records them on the chain log. Then the frontend queries the log to fetch the numbers.

There are 2 reasons for that design decision:

1. After obtaining a random number, the smart contract never needs it again
1. The only user of all the previous random numbers is the frontend

Knowing those requirements, and having in mind that storing data in log requires less gas than
storing data in smart contract storage, I've decided to use the log for this specific case. I know,
I know... it doesn't make any sense that a smart contract goes through all the hassle of securely
requesting a random number from an oracle, and then do nothing with that, but let an off-chain
frontend to query the data from a log which is accessible only off-chain. In that case, I could
make it all more simple, forget about oracles and generate random numbers off-chain.

Keep in mind that this is a demo of how to request a random number from an oracle using Chainlink
VRF v2, not a demo of what a smart contract could do with a random number, once it gets it 🙂


Where can I see it in action?
-----------------------------

To access the app, go to https://boban.ninja/randomness

The contract is currently deployed only on Rinkeby, because that's the only [?] testnet where
Chainlink VRF v2 Aggregator contract is deployed.


Technologies used
-----------------

I could never do this without the other amazing open-source projects. Here are the major
technologies I used. Definitely my favorite stack:

- [Solidity](https://github.com/ethereum/solidity)
- [TypeScript](https://github.com/microsoft/TypeScript)
- [Ethers.js](https://github.com/ethers-io/ethers.js)
- [Hardhat](https://github.com/NomicFoundation/hardhat)
- [Vue.js](https://github.com/vuejs/core)
- [Vite](https://github.com/vitejs/vite)


Deploy it yourself
------------------

The best way to learn something is to do it yourself. Besides using my hosted instance, you are
more than welcome to use the code from this repo to deploy your own version of smart contract and
frontend. If you love to play with Hardhat, TypeScript and Vue.js, you're going to enjoy this.


**BACKEND**

For Chainlink VRF v2 to work, you will have to create a subscription with Chainlink:

https://vrf.chain.link/rinkeby

Once you have your subscription ID, you are ready to deploy the smart contract.

The deploy script needs VRF subscription ID. You will need to replace the value of
`VRF_SUBSCRIPTION_ID` in `app.config.ts` file, located in project root folder.

Once that is completed, it is time to deploy the Randomness smart contract:

```bash
cd ./packages/backend
pnpm hardhat run ./scripts/deploy.ts --network rinkeby
```

Once the process is completed, you will have an address of your newly deployed contract. Head back
to VRF subscription page to make your newly deployed contract a consumer of the subscription.

Once you are there, you can fund your subscription with LINK, which is how you pay to Chainlink for
using their service. If you need Rinkeby LINK token, you can get it from Chainlink faucet:

https://faucets.chain.link/rinkeby

By now you also know in which block the contract has been deployed. Our app uses that info when it
requests the history of random numbers. It doesn't make sense to query blockchain for events in
blocks earlier than the block where our contract was deployed.

To set the starting block used by search query, go back to `app.config.ts` and update the value of
`CONTRACT_BLOCK_DEPLOYED` param.

Besides deploy script, `scripts` folder also includes a few CLI scripts, which you can play with:

1. `get-subscription-detals` -- how much link you have left, how many request are fulfilled...
1. `get-numbers-history` -- reads the logs and shows the details of all previous requests
1. `request-random-number` -- make your request here, if you don't like the web frontend

Yeah, you will also need to install dependencies using `pnpm` or any other Node package manager of
your choice, but unlike all the other guides, I will skip that part. If you reached this point in
documentation, you definitely don't need me to hold your hand while you're installing project
dependencies 😀


**FRONTEND**

This project uses Vue3 SFC via the new Composition API _script setup_, which is way cooler than
using Composition API the old way using _setup function_, and not to mention the bloated legacy
Options API. Once you try script setup, you will never look at the other ways to use Vue3 😀

For development server and build process, I used Vite, and I can highly recommend it. If you're
still using vue-cli and webpack, I'm sure you will be impressed by how fast and elegant Vite is.

To start the frontend in development mode on a local web server, while having Vite installed as a
global dependency, simply run.

```bash
vite
```

If Vite is installed as a local dependency, you'll have to be just a little bit more verbose and
prefix it with your package manager of your choice. I choose `pnpm`.

```bash
pnpm vite
```

Before starting a build process, it is a good idea to check for any TypeScript errors in the code.
This script is very handy:

```bash
pnpm run build
```

It will first check your TypeScript code with `tsc` and then build the frontend files to `./dist`
folder.

Before deploying the frontend, you might want to try out the newly built bundle by using:

```bash
vite preview
```

Don't forget to prefix that with `pnpm`, `npx` or `yarn` if you don't have Vite installed globally.
