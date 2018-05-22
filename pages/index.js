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

  onLogin = async event => {
    event.preventDefault();

    this.setState({ loading: true, errorMessage: '' });

    const accounts = await web3.eth.getAccounts();
    if (accounts.length) {
      const ballotId = await vote.methods.contributors(accounts[0]).call();
      let ballot = {};
      if (ballotId) {
        ballot = await vote.methods.ballots(ballotId -1);
      }
      this.setState({
        address: accounts[0],
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
          <Row><Cell>totalLan</Cell><Cell>{summary[10]}</Cell></Row>
        </Body>
      </Table>
    );
  }

  renderVote() {
    const { Row, Cell, Body } = Table;

    if (this.state.loggedIn) {

      let registered = "False";
      if (this.state.ballotId > 0) {
        registered = "True";
      }

      return <h1>Hi</h1>
      return (
        <Table>
        <Body>
          <Row><Cell>Your Address</Cell><Cell>{ this.state.address }</Cell></Row>
          <Row><Cell>Registered</Cell><Cell>{ registered }</Cell></Row>
          <Row><Cell>Ballot ID</Cell><Cell>{ this.state.ballotId }</Cell></Row>
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

  render() {

    return (
      <Layout>
        <div>
          <h3>Ballot Summary</h3>
          <div>
            { this.renderSummary() }
          </div>
          <h3>Place Your Vote</h3>
          <div>
            { this.renderVote() }
          </div>
        </div>
      </Layout>
    )
  }
}

export default VoteIndex;
