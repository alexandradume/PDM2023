import React, { memo } from 'react';
import { getLogger } from '../core';

const log = getLogger('Item');

interface ItemProps {
  id?: string;
  text: string;
}

const Item: React.FC<ItemProps> = ({ id, text }) => {
  log(`render ${text}`);
  return (
    <div>{text}</div>
  );
};

export default memo(Item);
