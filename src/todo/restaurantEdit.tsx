import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonLoading,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { getLogger } from "../core";
import { RestaurantContext } from "./ReataurantProvider";
import { RouteComponentProps } from "react-router";
import { RestaurantProps } from "./RestaurantProps";

const log = getLogger("RestaurantEdit");

interface RestaurantEditProps
  extends RouteComponentProps<{
    id?: string;
  }> {}

const RestaurantEdit: React.FC<RestaurantEditProps> = ({ history, match }) => {
  const { restaurants, saving, savingError, saveRestaurant } =
    useContext(RestaurantContext);
  const [name, setName] = useState("");
  const [stars, setStars] = useState(0);

  const [restaurant, setRestaurant] = useState<RestaurantProps>();
  useEffect(() => {
    log("useEffect");
    const routeId = match.params.id || "";
    const restaurant = restaurants?.find((it) => it.id === routeId);
    setRestaurant(restaurant);
    if (restaurant) {
      setName(restaurant.name);
      setStars(restaurant.stars);
    }
  }, [match.params.id, restaurants]);
  const handleSave = useCallback(() => {
    const editedRestaurant = restaurant
      ? { ...restaurant, name, stars }
      : { name, stars };
    saveRestaurant &&
      saveRestaurant(editedRestaurant).then(() => history.goBack());
  }, [restaurant, saveRestaurant, name, stars, history]);
  log("render");
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Edit</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleSave}>Save</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonItem>
          <IonLabel>Name:</IonLabel>
          <IonInput
            value={name}
            onIonChange={(e) => setName(e.detail.value || "")}
          />
        </IonItem>
        <IonItem>
          <IonLabel>Number of Stars:</IonLabel>
          <IonInput
            value={stars}
            onIonChange={(e) => setStars(parseInt(e.detail.value || "0", 10))}
          />
        </IonItem>
        <IonLoading isOpen={saving} />
        {savingError && (
          <div>{savingError.message || "Failed to save restaurant"}</div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default RestaurantEdit;
