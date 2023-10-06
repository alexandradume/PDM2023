import React, { useCallback, useMemo, useState } from 'react';
import { IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { add } from 'ionicons/icons';
import Item from './Item';
import { getLogger } from '../core';

const log = getLogger('ItemList');

const ItemList: React.FC = () => {
  const [items, setItems] = useState([
    { id: '1', text: 'Learn React' },
    { id: '2', text: 'Learn Ionic' }
  ]);

  const count = useMemo(() => {
    log('calculate count');
    return items.length;
  }, [items]);

  const addItem = useCallback(() => {
    const id = `${items.length + 1}`;
    log('addItem');
    setItems(items.concat({ id, text: `New item ${id}` }));
  }, [items, setItems]);

  log('render');
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>My App</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div>Item count: {count}</div>
        {items.map(({ id, text}) => <Item key={id} text={text} />)}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={addItem}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default ItemList;
