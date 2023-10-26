import React, { useCallback, useEffect, useReducer } from "react";
import PropTypes from "prop-types";
import { getLogger } from "../core";
import { RestaurantProps } from "./RestaurantProps";
import {
  createRestaurant,
  getRestaurants,
  newWebSocket,
  updateRestaurant,
} from "./restaurantApi";

const log = getLogger("RestaurantProvider");

type SaveRestaurantFn = (restaurant: RestaurantProps) => Promise<any>;

export interface RestaurantsState {
  restaurants?: RestaurantProps[];
  fetching: boolean;
  fetchingError?: Error | null;
  saving: boolean;
  savingError?: Error | null;
  saveRestaurant?: SaveRestaurantFn;
}

interface ActionProps {
  type: string;
  payload?: any;
}

const initialState: RestaurantsState = {
  fetching: false,
  saving: false,
};

const FETCH_RESTAURANTS_STARTED = "FETCH_RESTAURANTS_STARTED";
const FETCH_RESTAURANTS_SUCCEEDED = "FETCH_RESTAURANTS_SUCCEEDED";
const FETCH_RESTAURANTS_FAILED = "FETCH_RESTAURANTS_FAILED";
const SAVE_RESTAURANT_STARTED = "SAVE_RESTAURANT_STARTED";
const SAVE_RESTAURANT_SUCCEEDED = "SAVE_RESTAURANT_SUCCEEDED";
const SAVE_RESTAURANT_FAILED = "SAVE_RESTAURANT_FAILED";

const reducer: (
  state: RestaurantsState,
  action: ActionProps
) => RestaurantsState = (state, { type, payload }) => {
  switch (type) {
    case FETCH_RESTAURANTS_STARTED:
      return { ...state, fetching: true, fetchingError: null };
    case FETCH_RESTAURANTS_SUCCEEDED:
      return { ...state, restaurants: payload.restaurants, fetching: false };
    case FETCH_RESTAURANTS_FAILED:
      return { ...state, fetchingError: payload.error, fetching: false };
    case SAVE_RESTAURANT_STARTED:
      return { ...state, savingError: null, saving: true };
    case SAVE_RESTAURANT_SUCCEEDED:
      const restaurants = [...(state.restaurants || [])];
      console.log(restaurants);
      const restaurant = payload.restaurant;
      const index = restaurants.findIndex((it) => it.id === restaurant.id);
      if (index === -1) {
        restaurants.splice(0, 0, restaurant);
      } else {
        restaurants[index] = restaurant;
      }
      return { ...state, restaurants, saving: false };
    case SAVE_RESTAURANT_FAILED:
      return { ...state, savingError: payload.error, saving: false };
    default:
      return state;
  }
};

export const RestaurantContext =
  React.createContext<RestaurantsState>(initialState);

interface RestaurantProviderProps {
  children: PropTypes.ReactNodeLike;
}

export const RestaurantProvider: React.FC<RestaurantProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { restaurants, fetching, fetchingError, saving, savingError } = state;
  useEffect(getRestaurantsEffect, []);
  useEffect(wsEffect, []);
  const saveRestaurant = useCallback<SaveRestaurantFn>(
    saveRestaurantCallback,
    []
  );
  const value = {
    restaurants,
    fetching,
    fetchingError,
    saving,
    savingError,
    saveRestaurant,
  };
  log("returns");
  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );

  function getRestaurantsEffect() {
    let canceled = false;
    fetchRestaurants();
    return () => {
      canceled = true;
    };

    async function fetchRestaurants() {
      try {
        log("fetchRestaurants started");
        dispatch({ type: FETCH_RESTAURANTS_STARTED });
        const restaurants = await getRestaurants();
        log("fetchRestaurants succeeded");
        if (!canceled) {
          dispatch({
            type: FETCH_RESTAURANTS_SUCCEEDED,
            payload: { restaurants },
          });
        }
      } catch (error) {
        log("fetchRestaurants failed");
        if (!canceled) {
          dispatch({ type: FETCH_RESTAURANTS_FAILED, payload: { error } });
        }
      }
    }
  }

  async function saveRestaurantCallback(restaurant: RestaurantProps) {
    try {
      log("saveRestaurant started");
      dispatch({ type: SAVE_RESTAURANT_STARTED });
      const savedRestaurant = await (restaurant.id
        ? updateRestaurant(restaurant)
        : createRestaurant(restaurant));
      log("saveRestaurant succeeded");
      dispatch({
        type: SAVE_RESTAURANT_SUCCEEDED,
        payload: { restaurant: savedRestaurant },
      });
    } catch (error) {
      log("saveRestaurant failed");
      dispatch({ type: SAVE_RESTAURANT_FAILED, payload: { error } });
    }
  }

  function wsEffect() {
    let canceled = false;
    log("wsEffect - connecting");
    const closeWebSocket = newWebSocket((message) => {
      if (canceled) {
        return;
      }
      const {
        event,
        payload: { restaurant },
      } = message;
      log(`ws message, restaurant ${event}`);
      if (event === "created" || event === "updated") {
        dispatch({ type: SAVE_RESTAURANT_SUCCEEDED, payload: { restaurant } });
      }
    });
    return () => {
      log("wsEffect - disconnecting");
      canceled = true;
      closeWebSocket();
    };
  }
};
