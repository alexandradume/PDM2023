import React, { memo } from "react";
import { IonItem, IonLabel } from "@ionic/react";
import { getLogger } from "../core";
import { RestaurantProps } from "./RestaurantProps";

const log = getLogger("Restaurant");

interface RestaurantPropsExt extends RestaurantProps {
  onEdit: (id?: string) => void;
}

const Restaurant: React.FC<RestaurantPropsExt> = ({
  id,
  name,
  stars,
  onEdit,
}) => {
  return (
    <IonItem onClick={() => onEdit(id)}>
      <IonLabel>
        {name} {stars}
      </IonLabel>
    </IonItem>
  );
};

export default memo(Restaurant);
