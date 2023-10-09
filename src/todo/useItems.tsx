import { useCallback, useEffect, useState } from 'react';
import { getLogger } from '../core';
import { ItemProps } from './ItemProps';
import { getItems } from './itemApi';

const log = getLogger('useItems');

export interface ItemsState {
  items?: ItemProps[],
  fetching: boolean,
  fetchingError?: Error,
}

export interface ItemsProps extends ItemsState {
  addItem: () => void,
}

export const useItems: () => ItemsProps = () => {
  const [fetching, setFetching] = useState<boolean>(false);
  const [items, setItems] = useState<ItemProps[]>();
  const [fetchingError, setFetchingError] = useState<Error>();
  const addItem = useCallback(() => {
    log('addItem - TODO');
  }, []);
  useEffect(getItemsEffect, []);
  log(`returns - fetching = ${fetching}, items = ${JSON.stringify(items)}`);
  return {
    items,
    fetching,
    fetchingError,
    addItem,
  };

  function getItemsEffect() {
    let canceled = false;
    fetchItems();
    return () => {
      canceled = true;
    }

    async function fetchItems() {
      try {
        log('fetchItems started');
        setFetching(true);
        const items = await getItems();
        log('fetchItems succeeded');
        if (!canceled) {
          setFetching(false);
          setItems(items);
        }
      } catch (error) {
        log('fetchItems failed');
        if (!canceled) {
          setFetching(false);
          setFetchingError(error as Error);
        }
      }
    }
  }
};
