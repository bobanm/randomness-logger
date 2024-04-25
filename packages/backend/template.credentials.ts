/*

    IMPORTANT

    This is just a template file, and it is not used by the app. In order for the app to use it:

    1. rename this file to .credentials.ts, which will be ignored by Git
    2. replace the dummy values with your actual keys


    These keys are NOT used by:
    - the frontend app, which relies on your Web3 wallet to obtain provider and signer
    - CLI demo or tests if you run them on in-memory blockchain, which is the default Hardhat behavior

    These keys are used only when you explicitly request to run CLI demo or tests on an external network, e.g.:

    pnpm hardhat run ./scripts/some-script.ts --network sepolia
    pnpm hardhat test ./test/some-test.test.ts --network sepolia

*/

export const ALCHEMY_API_KEY = '1111111111111111111111111111111'
export const ETHERSCAN_API_KEY = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'

export const PRIVATE_KEYS = [
    '0x1111111111111111111111111111111111111111111111111111111111111111',
    '0x2222222222222222222222222222222222222222222222222222222222222222',
]