'use strict';

const PromiseTracking = require('./index');

PromiseTracking.inject(Promise);

setTimeout(async () => {

  let ShortTask = PromiseTracking.timeout(() => 'BIG ENTITY', 100);
  await PromiseTracking(ShortTask)
    .at(0, () => {
      console.time('Short task at');
      console.log('Short task 100ms started.', `
      Send request.
      Show loader.`
    )})
    .at(500, () => console.timeLog('Short task at', `
      This task may take a long time.
      Hide loader.
      Show progress bar.`
    ))
    .at(2000, (cancel) => {
      console.timeLog('Short task at', `
      Server is busy.
      Cancel process.
      Hide progress bar.
      Ask the user to try again later.`);
      cancel();
    })
    .then(val => console.timeLog('Short task at', `
      Create ${val} successfully`
    ))
    .catch(err => console.timeLog('Short task at', `
      ERROR : ${err.message}`
    ));

  console.log('------------------------------------');

  let LongTask = PromiseTracking.timeout(() => 'BIG ENTITY', 1000);
  await PromiseTracking(LongTask)
    .at(0, () => {
      console.time('Long task at');
      console.log('Long task 1000ms started', `
      Send request.
      Show loader.`
    )})
    .at(500, () => console.timeLog('Long task at', `
      This task may take a long time.
      Hide loader.
      Show progress bar.`
    ))
    .at(2000, (cancel) => {
      console.timeLog('Long task at', `
      Server is busy.
      Cancel process.
      Hide progress bar.
      Ask the user to try again later.`);
      cancel();
    })
    .then(val => console.timeLog('Long task at', `
      Create ${val} successfully`
    ))
    .catch(err => console.timeLog('Long task at', `
      ERROR : ${err.message}`
    ));

  console.log('------------------------------------');
  
  let VeryLongTask = PromiseTracking.timeout(() => 'BIG ENTITY', 5000);
  await PromiseTracking(VeryLongTask)
    .at(0, () => {
      console.time('Very long task at');
      console.log('Very long task 5000ms started', `
      Send request.
      Show loader.`
    )})
    .at(500, () => console.timeLog('Very long task at', `
      This task may take a long time.
      Hide loader.
      Show progress bar.`
    ))
    .at(2000, (cancel) => {
      console.timeLog('Very long task at', `
      Server is busy.
      Cancel process.
      Hide progress bar.
      Ask the user to try again later.`);
      cancel();
    })
    .then(val => console.timeLog('Very long task at', `
      Create ${val} successfully`
    ))
    .catch(err => console.timeLog('Very long task at', `
      ERROR : ${err.message}`
    ));

  console.log('------------------------------------');

  let FailTask = PromiseTracking.timeout(() => {
    throw new Error('Some thing went wrong');
  }, 1000);
  await PromiseTracking(FailTask)
    .at(0, () => {
      console.time('Fail task at');
      console.log('Fail task 1000ms started', `
      Send request.
      Show loader.`
    )})
    .at(500, () => console.timeLog('Fail task at', `
      This task may take a long time.
      Hide loader.
      Show progress bar.`
    ))
    .at(2000, (cancel) => {
      console.timeLog('Fail task at', `
      Server is busy.
      Cancel process.
      Hide progress bar.
      Ask the user to try again later.`);
      cancel();
    })
    .then(val => console.timeLog('Fail task at', `
      Create ${val} successfully`
    ))
    .catch(err => console.timeLog('Fail task at', `
      ERROR : ${err.message}`
    ));
  
}, 1000);

/* Will print :
Short task 100ms started.
      Send request.
      Show loader.
Short task at: 97.100ms
      Create BIG ENTITY successfully
------------------------------------
Long task 1000ms started
      Send request.
      Show loader.
Long task at: 500.006ms
      This task may take a long time.
      Hide loader.
      Show progress bar.
Long task at: 999.514ms
      Create BIG ENTITY successfully
------------------------------------
Very long task 5000ms started
      Send request.
      Show loader.
Very long task at: 498.575ms
      This task may take a long time.
      Hide loader.
      Show progress bar.
Very long task at: 1998.387ms
      Server is busy.
      Cancel process.
      Hide progress bar.
      Ask the user to try again later.
------------------------------------
Fail task 1000ms started
      Send request.
      Show loader.
Fail task at: 499.030ms
      This task may take a long time.
      Hide loader.
      Show progress bar.
Fail task at: 1004.734ms
      ERROR : Some thing went wrong
*/