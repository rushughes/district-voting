import React from 'react';
import { Menu } from 'semantic-ui-react';
import { Link } from '../routes';
import { title, voteContractAddress } from '../config';

export default () => {
  return (
    <Menu style={{ marginTop: '10px' }}>
      <Link route="/">
        <a className="item">
          {title} {voteContractAddress}
        </a>
      </Link>
    </Menu>
  );
};
