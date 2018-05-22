import React, { Component } from 'react';
import { Table } from 'semantic-ui-react';

class Summary extends Component {

  render() {

    const { Row, Cell, Body } = Table;
    const { summary } = this.props;
    const started = (summary[0] ? "True" : "False");
    const ended = (summary[2] ? "True" : "False");

    return (
      <Table>
        <Body>
          <Row><Cell>Number Of Registered Contributors</Cell><Cell>{summary[9]}</Cell></Row>
          <Row><Cell>Number Of Registered LANDs</Cell><Cell>{summary[10]}</Cell></Row>
          <Row><Cell>Voting Started?</Cell><Cell>{started}</Cell></Row>
          <Row><Cell>Time Voting Ends</Cell><Cell>{summary[1]}</Cell></Row>
          <Row><Cell>Voting Ended?</Cell><Cell>{ended}</Cell></Row>
          <Row><Cell>Number Of Ballots Received</Cell><Cell>{summary[3]}</Cell></Row>
          <Row><Cell>Number Of LANDs Represented</Cell><Cell>{summary[4]}</Cell></Row>
          <Row><Cell>Votes For</Cell><Cell>{summary[5]}</Cell></Row>
          <Row><Cell>Votes Against</Cell><Cell>{summary[6]}</Cell></Row>
          <Row><Cell>LAND For</Cell><Cell>{summary[7]}</Cell></Row>
          <Row><Cell>LAND Against</Cell><Cell>{summary[8]}</Cell></Row>          
        </Body>
      </Table>
    );
  }

}

export default Summary;
