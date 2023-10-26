import axios from "axios";
import { getLogger } from "../core";
import { RestaurantProps } from "./RestaurantProps";

const log = getLogger("restaurantApi");

const baseUrl = "localhost:3000";
const restaurantUrl = `http://${baseUrl}/restaurant`;

interface ResponseProps<T> {
  data: T;
}

function withLogs<T>(
  promise: Promise<ResponseProps<T>>,
  fnName: string
): Promise<T> {
  log(`${fnName} - started`);
  return promise
    .then((res) => {
      log(`${fnName} - succeeded`);
      return Promise.resolve(res.data);
    })
    .catch((err) => {
      log(`${fnName} - failed`);
      return Promise.reject(err);
    });
}

const config = {
  headers: {
    "Content-Type": "application/json",
  },
};

export const getRestaurants: () => Promise<RestaurantProps[]> = () => {
  return withLogs(
    axios.get(`http://${baseUrl}/restaurants`, config),
    "getRestaurants"
  );
};

export const createRestaurant: (
  restaurant: RestaurantProps
) => Promise<RestaurantProps[]> = (restaurant) => {
  return withLogs(
    axios.post(restaurantUrl, restaurant, config),
    "createRestaurant"
  );
};

export const updateRestaurant: (
  restaurant: RestaurantProps
) => Promise<RestaurantProps[]> = (restaurant) => {
  return withLogs(
    axios.put(`${restaurantUrl}/${restaurant.id}`, restaurant, config),
    "updateRestaurant"
  );
};

interface MessageData {
  event: string;
  payload: {
    restaurant: RestaurantProps;
  };
}

export const newWebSocket = (onMessage: (data: MessageData) => void) => {
  const ws = new WebSocket(`ws://${baseUrl}`);
  ws.onopen = () => {
    log("web socket onopen");
  };
  ws.onclose = () => {
    log("web socket onclose");
  };
  ws.onerror = (error) => {
    log("web socket onerror", error);
  };
  ws.onmessage = (messageEvent) => {
    log("web socket onmessage");
    onMessage(JSON.parse(messageEvent.data));
  };
  return () => {
    ws.close();
  };
};
