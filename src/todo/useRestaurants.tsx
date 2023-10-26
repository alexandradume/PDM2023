import { useCallback, useEffect, useReducer } from "react";
import { getLogger } from "../core";
import { RestaurantProps } from "./RestaurantProps";
import { getRestaurants } from "./restaurantApi";

const log = getLogger("useRestaurants");

export interface RestaurantsState {
  restaurants?: RestaurantProps[];
  fetching: boolean;
  fetchingError?: Error;
}

export interface RestaurantsProps extends RestaurantsState {
  addRestaurant: () => void;
}

interface ActionProps {
  type: string;
  payload?: any;
}

const initialState: RestaurantsState = {
  restaurants: undefined,
  fetching: false,
  fetchingError: undefined,
};

const FETCH_ITEMS_STARTED = "FETCH_ITEMS_STARTED";
const FETCH_ITEMS_SUCCEEDED = "FETCH_ITEMS_SUCCEEDED";
const FETCH_ITEMS_FAILED = "FETCH_ITEMS_FAILED";

const reducer: (
  state: RestaurantsState,
  action: ActionProps
) => RestaurantsState = (state, { type, payload }) => {
  switch (type) {
    case FETCH_ITEMS_STARTED:
      return { ...state, fetching: true };
    case FETCH_ITEMS_SUCCEEDED:
      return { ...state, restaurants: payload.restaurants, fetching: false };
    case FETCH_ITEMS_FAILED:
      return { ...state, fetchingError: payload.error, fetching: false };
    default:
      return state;
  }
};

export const useRestaurants: () => RestaurantsProps = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { restaurants, fetching, fetchingError } = state;
  const addRestaurant = useCallback(() => {
    log("addRestaurant - TODO");
  }, []);
  useEffect(getRestaurantsEffect, [dispatch]);
  log(
    `returns - fetching = ${fetching}, restaurants = ${JSON.stringify(
      restaurants
    )}`
  );
  return {
    restaurants,
    fetching,
    fetchingError,
    addRestaurant,
  };

  function getRestaurantsEffect() {
    let canceled = false;
    fetchRestaurants();
    return () => {
      canceled = true;
    };

    async function fetchRestaurants() {
      try {
        log("fetchRestaurants started");
        dispatch({ type: FETCH_ITEMS_STARTED });
        const restaurants = await getRestaurants();
        log("fetchRestaurants succeeded");
        if (!canceled) {
          dispatch({ type: FETCH_ITEMS_SUCCEEDED, payload: { restaurants } });
        }
      } catch (error) {
        log("fetchRestaurants failed");
        if (!canceled) {
          dispatch({ type: FETCH_ITEMS_FAILED, payload: { error } });
        }
      }
    }
  }
};
