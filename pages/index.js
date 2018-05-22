import React, { Component } from 'react';
import { Form, Table, Button, Message } from 'semantic-ui-react';
import vote from '../ethereum/vote';
import web3 from '../ethereum/web3';
import Layout from '../components/Layout';
import { Link } from '../routes';

class VoteIndex extends Component {

  state = {
    address: '',
    loggedIn: false,
    loading: false,
    ballotId: 0,
    ballot: {},
    errorMessage: ''
  }

  static async getInitialProps() {
    const summary = await vote.methods.getSummary().call();

    return { summary };
  }

  onFor = async () => {
    try {
      this.setState({ loading: true, errorMessage: '' });

      const accounts = await web3.eth.getAccounts();
      await vote.methods.registerVote('true').send({
        from: accounts[0]
      });
      Router.pushRoute('/results');
    } catch (err) {
      this.setState({ errorMessage: err.message });
    }
    this.setState({ loading: false });
  };

  onAgainst = async () => {
    try {
      this.setState({ loading: true, errorMessage: '' });

      const accounts = await web3.eth.getAccounts();
      await vote.methods.registerVote('false').send({
        from: accounts[0]
      });
      Router.pushRoute('/results');
    } catch (err) {
      this.setState({ errorMessage: err.message });
    }
    this.setState({ loading: false });
  };

  onLogin = async event => {
    event.preventDefault();

    this.setState({ loading: true, errorMessage: '' });

    const accounts = await web3.eth.getAccounts();
    console.log(accounts);
    if (accounts.length > 0) {
      const address = accounts[0];

      const ballotId = await vote.methods.contributors(address).call();
      let ballot = {};
      if (ballotId > 0) {
        ballot = await vote.methods.ballots(ballotId -1).call();
        console.log(ballot);
      }
      this.setState({
        address: address,
        loggedIn: true,
        ballotId: ballotId,
        ballot: ballot,
      });
    } else {
      this.setState({ errorMessage: "No ethereum addresses detected. Are you logged in to Metamask?" });
    }
    this.setState({ loading: false });
  }

  renderSummary() {

    const { Row, Cell, Body } = Table;
    const { summary } = this.props;
    const started = (summary[0] ? "True" : "False");
    const ended = (summary[2] ? "True" : "False");

    return (
      <Table>
        <Body>
          <Row><Cell>started</Cell><Cell>{started}</Cell></Row>
          <Row><Cell>endTimestamp</Cell><Cell>{summary[1]}</Cell></Row>
          <Row><Cell>ended</Cell><Cell>{ended}</Cell></Row>
          <Row><Cell>voterCount</Cell><Cell>{summary[3]}</Cell></Row>
          <Row><Cell>landCount</Cell><Cell>{summary[4]}</Cell></Row>
          <Row><Cell>forVoteCount</Cell><Cell>{summary[5]}</Cell></Row>
          <Row><Cell>againstVoteCount</Cell><Cell>{summary[6]}</Cell></Row>
          <Row><Cell>forLandCount</Cell><Cell>{summary[7]}</Cell></Row>
          <Row><Cell>againstLandCount</Cell><Cell>{summary[8]}</Cell></Row>
          <Row><Cell>totalVoters</Cell><Cell>{summary[9]}</Cell></Row>
          <Row><Cell>totalLand</Cell><Cell>{summary[10]}</Cell></Row>
        </Body>
      </Table>
    );
  }

  renderYourSummary() {
    const { Row, Cell, Body } = Table;

    if (this.state.loggedIn) {

      let registered = "False";
      if (this.state.ballotId > 0) {
        registered = "True";
      }

      let voted = "False";
      if (this.state.ballot.voteTimestamp > 0) {
        voted = "True";
      }

      return (
        <Table>
        <Body>
          <Row><Cell>Your Address</Cell><Cell>{ this.state.address }</Cell></Row>
          <Row><Cell>Registered</Cell><Cell>{ registered }</Cell></Row>
          <Row><Cell>Ballot ID</Cell><Cell>{ this.state.ballotId }</Cell></Row>
          <Row><Cell>Voted</Cell><Cell>{ voted }</Cell></Row>
        </Body>
        </Table>
      );
    } else {
      return (
        <Form onSubmit={this.onLogin} error={!!this.state.errorMessage}>
          <Button primary loading={this.state.loading}>Log In</Button>
          <Message error header="Oops!" content={this.state.errorMessage} />
        </Form>
      )
    }
  }



  renderVote() {
    const { summary } = this.props;
    const started = summary[0];
    const ended = summary[2];

    if (started && !ended) {

      if (this.state.loggedIn && this.state.ballot.voteTimestamp == 0) {
        const { Row, Cell, Body } = Table;
        return (
          <div>
            <h3>Vote To Become A Citizen!</h3>
            <Table>
              <Body>
                <Row>
                  <Cell><Button color="green" loading={this.state.loading} onClick={this.onFor}>For</Button></Cell>
                  <Cell><Button color="red" loading={this.state.loading} onClick={this.onAgainst}>Against</Button></Cell>
                </Row>
              </Body>
            </Table>
          </div>
        );
      } else if (this.state.loggedIn && this.state.ballot.voteTimestamp > 0){
        return (
          <h3>Thanks for being a citizen!</h3>
        );
      } else {
        return (
          <h3>Only registered contributors can vote!</h3>
        );
      }

    } else if ( started && ended ){
      return (
        <h3>This vote has ended!</h3>
      )
    } else {
      return (
        <h3>This vote has not started yet!</h3>
      )
    }
  }

  render() {
    return (
      <Layout>
        <div>
          <Link route={'/results'}>
            <a>Results</a>
          </Link>
          <h3>Ballot Summary</h3>
          <div>
            { this.renderSummary() }
          </div>
          <h3>Your Summary</h3>
          <div>
            { this.renderYourSummary() }
            { this.renderVote() }
          </div>
        </div>
      </Layout>
    )
  }
}

export default VoteIndex;
