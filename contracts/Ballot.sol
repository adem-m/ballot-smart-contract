// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Ballot {
    enum Choice {
        VERY_UNSATISFACTORY,
        UNSATISFACTORY,
        PASSABLE,
        SATISFACTORY,
        VERY_SATISFACTORY
    }

    struct Proposal {
        string content;
        uint decidingVote;
    }

    mapping(address => bool) private voters;
    Proposal[] private proposals;

    uint public proposalCount;
    address public chairman;
    string public description;
    bool public isOpen;

    modifier onlyWhenOpen {
        require(isOpen, "This ballot is already closed.");
        _;
    }

    constructor(string memory _description, string[] memory _proposalContents) {
        require(bytes(_description).length > 0, "You must provide a description for the ballot.");

        chairman = msg.sender;
        description = _description;
        isOpen = true;

        for (uint i = 0; i < _proposalContents.length; i++) {
            proposals.push(Proposal({
            content : _proposalContents[i],
            decidingVote : 0
            }));
        }
        proposalCount = _proposalContents.length;
    }

    function getProposal(uint _index) public view returns (Proposal memory) {
        return proposals[_index];
    }

    function vote(Choice[] memory _choices) public onlyWhenOpen {
        require(!voters[msg.sender], "You have already voted.");
        require(_choices.length == proposalCount, "The number of choices does not match the number of proposals.");

        voters[msg.sender] = true;
        for (uint i = 0; i < _choices.length; i++) {
            if (_choices[i] == Choice.SATISFACTORY || _choices[i] == Choice.VERY_SATISFACTORY) {
                proposals[i].decidingVote++;
            }
        }
    }

    function close() public onlyWhenOpen {
        require(msg.sender == chairman, "Only the chairman can close the ballot.");

        isOpen = false;
    }

    function getWinningProposal() public view returns (Proposal memory) {
        require(!isOpen, "The ballot is still open.");

        Proposal memory winner = proposals[0];
        for (uint i = 1; i < proposalCount; i++) {
            if (proposals[i].decidingVote > winner.decidingVote) {
                winner = proposals[i];
            }
        }
        return winner;
    }
}