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
    uint score;
  }

  struct VotingSession {
    string description;
    bool isOpen;
  }

  event VotingSessionCreated(uint votingSessionId, address chairman);
  event VoteRegistered(uint votingSessionId, address voter);
  event VotingSessionClosed(uint votingSessionId);

  modifier onlyWhenExists(uint _votingSessionId) {
    require(_votingSessionId < votingSessions.length, "Voting session not found");
    _;
  }

  modifier onlyWhenOpen(uint _votingSessionId) {
    require(_votingSessionId < votingSessions.length, "Voting session not found");
    require(votingSessions[_votingSessionId].isOpen, "This voting session is already closed.");
    _;
  }

  VotingSession[] public votingSessions;
  mapping(uint => address) private _votingSessionToChairman;
  mapping(uint => Proposal[]) private _proposalsBySession;
  mapping(uint => mapping(address => bool)) private _votersBySession;

  function initVotingSession(
    string memory _description, 
    string[] memory _proposalContents
  ) external {
    require(bytes(_description).length > 0, "You must provide a description for the voting session.");

    VotingSession memory session = VotingSession({
      description: _description,
      isOpen: true
    });

    votingSessions.push(session);
    uint votingSessionId = votingSessions.length - 1;
     _votingSessionToChairman[votingSessionId] = msg.sender;

    for(uint i = 0; i < _proposalContents.length; i++) {
      _proposalsBySession[votingSessionId].push(Proposal({
        content: _proposalContents[i],
        score: 0
      }));
    }

    emit VotingSessionCreated(votingSessionId, msg.sender);
  }

  function getVotingSessions(uint _from, uint _to) external view returns (VotingSession[] memory) {
    require(_from < _to && _to <= votingSessions.length);

    VotingSession[] memory sessions = new VotingSession[](_to - _from);
    for (uint i = _from; i < _to; i++) {
      sessions[i] = votingSessions[i];
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
      _proposalsBySession[_votingSessionId][i].score += uint(_choices[i]);
    }

    emit VoteRegistered(_votingSessionId, msg.sender);
  }

  function close(uint _votingSessionId) external onlyWhenOpen(_votingSessionId) {
    require(_votingSessionToChairman[_votingSessionId] == msg.sender);

    votingSessions[_votingSessionId].isOpen = false;

    emit VotingSessionClosed(_votingSessionId);
  }
}