import React, { Component } from 'react';
import { Form, Table, Button, Message } from 'semantic-ui-react';
import vote from '../ethereum/vote';
import web3 from '../ethereum/web3';
import Layout from '../components/Layout';
import { Link } from '../routes';

class Results extends Component {

  static async getInitialProps() {
    const summary = await vote.methods.getSummary().call();

    const totalVoters = summary[9];

    const ballots = await Promise.all(
      Array(parseInt(totalVoters)).fill().map((element, index) => {
        return vote.methods.ballots(index).call()
      })
    );

    return { summary, ballots };
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

  renderRows() {
    const { Row, Cell, Body } = Table;
    const { ballots } = this.props;
    
    return ballots.map((b, index) => {
          return (
              <Row>
                <Cell>{b.contributor}</Cell>
                <Cell>{b.land}</Cell>
                <Cell>{b.vote}</Cell>
                <Cell>{b.voteTimestamp}</Cell>
              </Row>
          );
        })
  }

  renderVotes() {

    const { Header, Row, HeaderCell, Body } = Table;

    return (
      <Table>
      <Header>
          <Row>
            <HeaderCell>Address</HeaderCell>
            <HeaderCell>LAND</HeaderCell>
            <HeaderCell>Vote</HeaderCell>
            <HeaderCell>Vote Timestamp</HeaderCell>
          </Row>
        </Header>
        <Body>
          {this.renderRows()}
        </Body>
      </Table>
    );

  }

  render() {

    return (
      <Layout>
        <div>
          <h3>Ballot Summary</h3>
          <div>
            { this.renderSummary() }
          </div>
          <h3>Votes</h3>
          <div>
            { this.renderVotes() }
          </div>
        </div>
      </Layout>
    )
  }
}

export default Results;
