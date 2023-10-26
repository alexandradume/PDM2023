import React, { useContext } from "react";
import { RouteComponentProps } from "react-router";
import {
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonList,
  IonLoading,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { add } from "ionicons/icons";
import Restaurant from "./Restaurant";
import { getLogger } from "../core";
import { RestaurantContext } from "./ReataurantProvider";

const log = getLogger("RestaurantList");

const RestaurantList: React.FC<RouteComponentProps> = ({ history }) => {
  const { restaurants, fetching, fetchingError } =
    useContext(RestaurantContext);
  log("render");
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>My App</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonLoading isOpen={fetching} message="Fetching restaurants" />
        {restaurants ? (
          <IonList>
            {restaurants.map(({ id, name, stars }) => (
              <Restaurant
                key={id}
                id={id}
                name={name}
                stars={stars}
                onEdit={() => history.push(`/restaurant/${id}`)}
              />
            ))}
          </IonList>
        ) : null}
        {fetchingError && (
          <div>{fetchingError.message || "Failed to fetch restaurants"}</div>
        )}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => history.push("/restaurant")}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default RestaurantList;
