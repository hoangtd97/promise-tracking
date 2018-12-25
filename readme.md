# Promise Tracking
Tracking promise status at multi time-points, and cancel the process if you want.

## Usage
```js
const PromiseTracking = require('promise-tracking');
const VeryLongTask    = PromiseTracking.timeout(() => 'BIG ENTITY', 5000);

console.time('At');

PromiseTracking(VeryLongTask)
  .at(0, (cancel) => {
    console.timeLog('At', `
    Send request.
    Show loader.`
  )})
  .at(500, (cancel) => console.timeLog('At', `
    This task may take a long time.
    Hide loader.
    Show progress bar.`
  ))
  .at(2000, (cancel) => {
    console.timeLog('At', `
    Server is busy.
    Cancel process.
    Hide progress bar.
    Ask the user to try again later.`);
    cancel();
  })
  .then(val => console.timeLog('At', `
    Create ${val} successfully`
  ))
  .catch(err => console.timeLog('At', `
    ERROR : ${err.message}`
  ));
```

### Will print :
```
At: 2.222ms
    Send request.
    Show loader.
At: 501.650ms
    This task may take a long time.
    Hide loader.
    Show progress bar.
At: 2001.007ms
    Server is busy.
    Cancel process.
    Hide progress bar.
    Ask the user to try again later.
```

### See [example](example.js) for more case.

---

### Injecting at() to Promise class for convenience use :
```js
const PromiseTracking = require('promise-tracking');

PromiseTracking.inject(Promise);

Promise.resolve()
  .at(200, (cancel) => {})
  .then()
```