import React, { Component } from 'react';
import { Form, Table, Button, Message } from 'semantic-ui-react';
import vote from '../ethereum/vote';
import web3 from '../ethereum/web3';
import Layout from '../components/Layout';
import Summary from '../components/Summary';
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
      <Summary summary={summary} />
    );
  }

  renderRows() {
    const { Row, Cell, Body } = Table;
    const { ballots } = this.props;

    return ballots.map((b, index) => {
      let v = '';
      let t = '';
      if (b.voteTimestamp > 0 && b.vote) {
        v = 'For';
      } else if (b.voteTimestamp > 0 && !b.vote) {
        v = 'Against';
      }
      if (b.voteTimestamp > 0) {

      }

          return (
              <Row>
                <Cell>{b.contributor}</Cell>
                <Cell>{b.land}</Cell>
                <Cell>{v}</Cell>
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
          <Link route={'/'}>
            <a>
              Back
            </a>
          </Link>
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
