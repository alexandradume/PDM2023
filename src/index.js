const Koa = require('koa');
const app = new Koa();
const server = require('http').createServer(app.callback());
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });
const Router = require('koa-router');
const cors = require('koa-cors');
const bodyparser = require('koa-bodyparser');

app.use(bodyparser());
app.use(cors());
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} ${ctx.response.status} - ${ms}ms`);
});

app.use(async (ctx, next) => {
  await new Promise(resolve => setTimeout(resolve, 5000));
  await next();
});

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.response.body = { issue: [{ error: err.message || 'Unexpected error' }] };
    ctx.response.status = 500;
  }
});

class Restaurant {
  constructor({ id, name,stars, date, version }) {
    this.id = id;
    this.name = name;
    this.stars = stars;
    this.version = version;
  }
}

const restaurants = [];
for (let i = 0; i < 3; i++) {
  restaurants
.push(new Restaurant
  ({ id: `${i}`, name: `restaurant ${i}`,stars: `stars ${i}`, date: new Date(Date.now() + i), version: 1 }));
}
let lastUpdated = restaurants[restaurants
.length - 1].date;
let lastId = restaurants[restaurants
.length - 1].id;
const pageSize = 10;

const broadcast = data =>
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });

const router = new Router();

router.get('/restaurants', ctx => {
  ctx.response.body = restaurants
;
  ctx.response.status = 200;
});

router.get('/restaurant/:id', async (ctx) => {
  const restaurantId = ctx.request.params.id;
  const restaurant = restaurants
.find(restaurant => restaurantId === restaurant.id);
  if (restaurant) {
    ctx.response.body = restaurant;
    ctx.response.status = 200; // ok
  } else {
    ctx.response.body = { message: `restaurant with id ${restaurantId} not found` };
    ctx.response.status = 404; // NOT FOUND (if you know the resource was deleted, then return 410 GONE)
  }
});

const createItem = async (ctx) => {
  const restaurant = ctx.request.body;
  if (!restaurant.name) { // validation
    ctx.response.body = { message: 'Name is missing' };
    ctx.response.status = 400; //  BAD REQUEST
    return;
  }
  restaurant.id = `${parseInt(lastId) + 1}`;
  lastId = restaurant.id;
  restaurant.date = new Date();
  restaurant.version = 1;
  restaurants
.push(restaurant);
  ctx.response.body = restaurant;
  ctx.response.status = 201; // CREATED
  broadcast({ event: 'created', payload: { restaurant } });
};

router.post('/restaurant', async (ctx) => {
  await createItem(ctx);
});

router.put('/restaurant/:id', async (ctx) => {
  const id = ctx.params.id;
  const restaurant = ctx.request.body;
  restaurant.date = new Date();
  const restaurantId = restaurant.id;
  if (restaurantId && id !== restaurant.id) {
    ctx.response.body = { message: `Param id and body id should be the same` };
    ctx.response.status = 400; // BAD REQUEST
    return;
  }
  if (!restaurantId) {
    await createItem(ctx);
    return;
  }
  const index = restaurants
.findIndex(restaurant => restaurant.id === id);
  if (index === -1) {
    ctx.response.body = { issue: [{ error: `restaurant with id ${id} not found` }] };
    ctx.response.status = 400; // BAD REQUEST
    return;
  }
  const itemVersion = parseInt(ctx.request.get('ETag')) || restaurant.version;
  if (itemVersion < restaurants
  [index].version) {
    ctx.response.body = { issue: [{ error: `Version conflict` }] };
    ctx.response.status = 409; // CONFLICT
    return;
  }
  restaurant.version++;
  restaurants
[index] = restaurant;
  lastUpdated = new Date();
  ctx.response.body = restaurant;
  ctx.response.status = 200; // OK
  broadcast({ event: 'updated', payload: { restaurant } });
});

router.del('/restaurant/:id', ctx => {
  const id = ctx.params.id;
  const index = restaurants
.findIndex(restaurant => id === restaurant.id);
  if (index !== -1) {
    const restaurant = restaurants
  [index];
    restaurants
  .splice(index, 1);
    lastUpdated = new Date();
    broadcast({ event: 'deleted', payload: { restaurant } });
  }
  ctx.response.status = 204; // no content
});

setInterval(() => {
  lastUpdated = new Date();
  lastId = `${parseInt(lastId) + 1}`;
  const restaurant = new Restaurant
({ id: lastId, name: `name ${lastId}`,stars: `stars ${lastId}`, date: lastUpdated, version: 1 });
  restaurants
.push(restaurant);
  console.log(`New restaurant: ${restaurant.name} ${restaurant.stars} `);
  broadcast({ event: 'created', payload: { restaurant } });
}, 5000);

app.use(router.routes());
app.use(router.allowedMethods());

server.listen(3000);
