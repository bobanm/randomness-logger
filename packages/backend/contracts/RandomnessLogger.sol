// SPDX-License-Identifier: DUDE
pragma solidity ^0.8.24;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

/**

    This contract requests one random number from Chainlink VRF oracle, and stores both request and
    response details in the blockchain log.

    The random numbers are not stored in contract state for one simple reason: After the random
    number is received and stored, the contract never tries to access the number again.

*/

contract RandomnessLogger is VRFConsumerBaseV2 {

    address constant VRF_COORDINATOR_ADDRESS = 0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625; // sepolia
    VRFCoordinatorV2Interface vrfCoordinator;

    // set of arguments required by vrfCoordinator.requestRandomWords() method
    uint64 immutable vrfSubscriptionId;
    bytes32 constant KEY_HASH = 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c; // sepolia
    uint16 constant MINIMUM_REQUEST_CONFIRMATIONS = 3;
    uint32 constant CALLBACK_GAS_LIMIT = 100000;
    uint32 constant NUM_WORDS = 1;

    event NumberRequested(uint requestId, uint blockNumber, uint timestamp, address indexed requestorAddress);
    event NumberReceived(uint requestId, uint blockNumber, uint timestamp, uint randomNumber);

    constructor (uint64 _vrfSubscriptionId) VRFConsumerBaseV2(VRF_COORDINATOR_ADDRESS) {

        vrfSubscriptionId = _vrfSubscriptionId;
        vrfCoordinator = VRFCoordinatorV2Interface(VRF_COORDINATOR_ADDRESS);
    }

    function requestRandomNumber () external {

        uint requestId = vrfCoordinator.requestRandomWords(KEY_HASH, vrfSubscriptionId, MINIMUM_REQUEST_CONFIRMATIONS, CALLBACK_GAS_LIMIT, NUM_WORDS);
        emit NumberRequested(requestId, block.number, block.timestamp, msg.sender);
    }

    function fulfillRandomWords (uint requestId, uint[] memory randomWords) internal override {

        emit NumberReceived(requestId, block.number, block.timestamp, randomWords[0]);
    }
}