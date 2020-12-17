# fullfillment api

## Get Started:

1. Install packages with `npm install`
2. Start the local server with `npm start`

## Orders / Restocks:

While the server is running, modify the `init()` function in `Main.ts`

### Initialize a catalogue:
```js
Inventory.init_catalogue(sampleInventory);
```
### Add a restock:
```js
Inventory.process_restock(restock);
```
### Process an order
```js
Orders.process_orders(order);
```

## Known Issues
* This would do well with some testing.
* Lacks a robust response handler. Would like to see properly formatted responses with error codes etc.
* Endpoints assume that data will be properly formatted. This will obviously not always be the case.
* The `process_orders()` function in the orders service could use some refactoring to make it more readable and elegant.
* The TypeScript type declarations could use a bit of improvement. They're a bit lacking.
* It'd be great to have a revovling user input function that gets user inputs on the command line.