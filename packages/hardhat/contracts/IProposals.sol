// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.0;

/**
 * @dev Interface of the {Proposals} core.
 */
interface IProposals {
    enum ProposalState {
        Pending,
        Active,
        Canceled,
        Defeated,
        Succeeded,
        Queued,
        Expired,
        Executed
    }
}