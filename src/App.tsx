import { Redirect, Route } from "react-router-dom";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";

import { RestaurantEdit, RestaurantList } from "./todo";
import { RestaurantProvider } from "./todo/ReataurantProvider";

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <RestaurantProvider>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route path="/restaurants" component={RestaurantList} exact={true} />
          <Route path="/restaurant" component={RestaurantEdit} exact={true} />
          <Route
            path="/restaurant/:id"
            component={RestaurantEdit}
            exact={true}
          />
          <Route exact path="/" render={() => <Redirect to="/restaurants" />} />
        </IonRouterOutlet>
      </IonReactRouter>
    </RestaurantProvider>
  </IonApp>
);

export default App;
