pragma solidity ^0.4.17;

contract Vote {

    struct Ballot {
        uint256 land;
        address contributor;
        bool vote;
        uint256 voteTimestamp;
    }

    // manager of the contract
    address public manager;

    //mapping of contributor address to ballot id
    mapping(address => uint256) public contributors;

    Ballot[] public ballots;

    bool public started;
    uint256 public endTimestamp;
    bool public ended;

    uint256 voterCount; // number of people who have voted
    uint256 landCount; // number of land who have voted
    uint256 forVoteCount; // number of votes for
    uint256 againstVoteCount; // number of votes against
    uint256 forLandCount; // number of land for
    uint256 againstLandCount; // number of land against

    uint256 totalVoters; // number of people registered to voted
    uint256 totalLand; // total land registered to vote

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    constructor() public {
        manager = msg.sender;
    }

    function startVote() public restricted {
        require(!started && !ended);

        started = true;
        endTimestamp = block.timestamp + ( 14 * 24 * 60 * 60);
    }

    function endVoteCheck() public restricted {
        require(started && !ended);

        if (block.timestamp > endTimestamp) {
            ended = true;
        }
    }

    function registerContributor(address _contributor, uint256 _land) public restricted {
        require(!started && !ended);
        //district members must have donated LAND
        require(_land > 0);
        //district members can't be added more than once
        require(contributors[_contributor] < 1);

        Ballot memory newBallot = Ballot({
            land: _land,
            contributor: _contributor,
            vote: false,
            voteTimestamp: 0
        });

        ballots.push(newBallot);

        //id always starts at 1, not 0
        contributors[_contributor] = ballots.length;

        totalVoters++;
        totalLand += _land;
    }

    function registerVote(bool _vote) public {
        require(started && !ended);
        // only district members can vote
        uint256 id = contributors[msg.sender];
        require(id > 0);
        // can only vote once
        Ballot storage ballot = ballots[id - 1];
        require(ballot.voteTimestamp == 0);

        if (now > endTimestamp) {
            ended = true;
        } else {
            ballot.vote = _vote;
            voterCount++;
            landCount += ballot.land;
            ballot.voteTimestamp = block.timestamp;

            if (_vote) {
                forVoteCount++;
                forLandCount += ballot.land;
            } else {
                againstVoteCount++;
                againstLandCount += ballot.land;
            }
        }
    }

    function getSummary() public view returns (
        bool, uint256, bool, uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint256
        ) {
            return (
                started,
                endTimestamp,
                ended,
                voterCount,
                landCount,
                forVoteCount,
                againstVoteCount,
                forLandCount,
                againstLandCount,
                totalVoters,
                totalLand
                );
        }
}
