// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract VotingSystem {
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

    struct VotingSession {
        string description;
        bool isOpen;
        uint closingTime;
    }

    event VotingSessionCreated(uint votingSessionId, address chairman);
    event VoteRegistered(uint votingSessionId, address voter);
    event VotingSessionClosed(uint votingSessionId);

    modifier onlyWhenExists(uint _votingSessionId) {
        require(_votingSessionId < votingSessions.length, "Voting session not found.");
        _;
    }

    modifier onlyWhenOpen(uint _votingSessionId) {
        require(_votingSessionId < votingSessions.length, "Voting session not found.");
        require(getIsOpen(_votingSessionId), "This voting session is already closed.");
        _;
    }

    VotingSession[] private votingSessions;
    mapping(uint => address) private _votingSessionToChairman;
    mapping(uint => Proposal[]) private _proposalsBySession;
    mapping(uint => mapping(address => bool)) private _votersBySession;

    function initVotingSession(
        string memory _description,
        string[] memory _proposalContents
    ) external {
        require(bytes(_description).length > 0, "You must provide a description for the voting session.");

        VotingSession memory session = VotingSession({
        description : _description,
        isOpen : true,
        closingTime : block.timestamp + 3 minutes
        });

        votingSessions.push(session);
        uint votingSessionId = votingSessions.length - 1;
        _votingSessionToChairman[votingSessionId] = msg.sender;

        for (uint i = 0; i < _proposalContents.length; i++) {
            _proposalsBySession[votingSessionId].push(Proposal({
            content : _proposalContents[i],
            decidingVote : 0
            }));
        }

        emit VotingSessionCreated(votingSessionId, msg.sender);
    }

    function getVotingSession(uint _votingSessionId) external view onlyWhenExists(_votingSessionId) returns (VotingSession memory) {
        VotingSession memory vs = votingSessions[_votingSessionId];
        vs.isOpen = getIsOpen(_votingSessionId);
        return vs;
    }

    function getVotingSessions(uint _from, uint _to) external view returns (VotingSession[] memory) {
        require(_from < _to, "Cannot get voting sessions");

        if (_from > votingSessions.length) {
            _from = 0;
        }
        if (_to > votingSessions.length) {
            _to = votingSessions.length;
        }
        VotingSession[] memory sessions = new VotingSession[](_to - _from);
        for (uint i = _from; i < _to; i++) {
            sessions[i] = votingSessions[i];
            sessions[i].isOpen = getIsOpen(i);
        }
        return sessions;
    }

    function getProposals(uint _votingSessionId) external view onlyWhenExists(_votingSessionId) returns (Proposal[] memory) {
        return _proposalsBySession[_votingSessionId];
    }

    function vote(uint _votingSessionId, Choice[] memory _choices) external onlyWhenOpen(_votingSessionId) {
        require(!_votersBySession[_votingSessionId][msg.sender], "You have already voted.");
        require(_choices.length == _proposalsBySession[_votingSessionId].length, "Incorrect number of choices.");

        _votersBySession[_votingSessionId][msg.sender] = true;
        for (uint i = 0; i < _choices.length; i++) {
            if (_choices[i] == Choice.SATISFACTORY || _choices[i] == Choice.VERY_SATISFACTORY) {
                _proposalsBySession[_votingSessionId][i].decidingVote++;
            }
        }

        emit VoteRegistered(_votingSessionId, msg.sender);
    }

    function close(uint _votingSessionId) external onlyWhenOpen(_votingSessionId) {
        require(_votingSessionToChairman[_votingSessionId] == msg.sender, "You are not the chairman.");

        votingSessions[_votingSessionId].isOpen = false;

        emit VotingSessionClosed(_votingSessionId);
    }

    function getWinningProposal(uint _votingSessionId) external view onlyWhenExists(_votingSessionId) returns (Proposal memory) {
        require(!getIsOpen(_votingSessionId), "This voting session is still open.");
        Proposal memory winner = _proposalsBySession[_votingSessionId][0];
        for (uint i = 1; i < _proposalsBySession[_votingSessionId].length; i++) {
            if (_proposalsBySession[_votingSessionId][i].decidingVote > winner.decidingVote) {
                winner = _proposalsBySession[_votingSessionId][i];
            }
        }
        return winner;
    }

    function getIsOpen(uint _votingSessionId) private view returns (bool) {
        return votingSessions[_votingSessionId].closingTime > block.timestamp;
    }
}