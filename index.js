'use strict';

module.exports = PromiseTrackingFactory;

const STATUS = {
  PENDING   : 'pending',
  FULFILLED : 'fulfilled',
  REJECTED  : 'rejected',
  CANCELLED : 'cancelled'
};

function PromiseTrackingFactory(promise) {
  return new PromiseTracking(promise);
}

PromiseTrackingFactory.inject = function inject(PromiseClass) {
  if (PromiseClass.prototype.at === undefined) {
    PromiseClass.prototype.at = function(time, doSomething) {
      return PromiseTrackingFactory(this).at(time, doSomething);
    }
  }
}

PromiseTrackingFactory.timeout = setTimeoutPromisified;

//------------------------------- Promise Tracking ----------------------------

function PromiseTracking(promise) {
  this.promise      = promise;
  this.status       = STATUS.PENDING;
  this.onFulfilled  = undefined;
  this.onRejected   = undefined;
  return this;
}

//---------------------------------- PROTOTYPES -------------------------------

/**
 * At this time, if the promise is still pending, do something
 * @description This method must be call before then() or catch().
 * @param {Number} time time
 * @param {Function} doSomething Receive a cancel function, \
 * that can use to cancel the promise if it still pending at this time,\
 * by don't invoke onFulfilled() and onRejected() pass to then() or catch() method.
 * 
 * @example
 * const PromiseTracking = require('./index');
 * const VeryLongTask    = PromiseTracking.timeout(() => 'BIG ENTITY', 5000);
 * 
 * console.time('At');
 * 
 * PromiseTracking(VeryLongTask)
 *   .at(0, () => {
 *     console.timeLog('At', `
 *     Send request.
 *     Show loader.`
 *   )})
 *   .at(500, () => console.timeLog('At', `
 *     This task may take a long time.
 *     Hide loader.
 *     Show progress bar.`
 *   ))
 *   .at(2000, (cancel) => {
 *     console.timeLog('At', `
 *     Server is busy.
 *     Cancel process.
 *     Hide progress bar.
 *     Ask the user to try again later.`);
 *     cancel();
 *   })
 *   .then(val => console.timeLog('At', `
 *     Create ${val} successfully`
 *   ))
 *   .catch(err => console.timeLog('At', `
 *     ERROR : ${err.message}`
 *   ));
 * 
 * let output = `
 * At: 2.222ms
 *     Send request.
 *     Show loader.
 * At: 501.650ms
 *     This task may take a long time.
 *     Hide loader.
 *     Show progress bar.
 * At: 2001.007ms
 *     Server is busy.
 *     Cancel process.
 *     Hide progress bar.
 *     Ask the user to try again later.
 * `
 */
PromiseTracking.prototype.at = function at(time, doSomething) {
  setTimeoutPromisified(() => {
    const $this = this;
    if (this.status === STATUS.PENDING) {
      doSomething(cancel);
    }
    //---------------------------------
    function cancel() {
      $this.status = STATUS.CANCELLED;
    }
  }, time, this);
  return this;
}

PromiseTracking.prototype.then = function then(onFulfilled, onRejected) {
  const $this       = this;
  this.onFulfilled  = typeof onFulfilled === 'function' ? onFulfilled : (...args) => Promise.resolve(...args);
  this.onRejected   = typeof onRejected  === 'function' ? onRejected : (...args) => Promise.reject(...args);
  return this.promise.then(_onFulfilled, _onRejected);

  //-----------------------------------
  function _onFulfilled() {
    if ($this.status === STATUS.PENDING) {
      $this.status = STATUS.FULFILLED;
      return $this.onFulfilled.apply(null, arguments);
    }
  }

  function _onRejected() {
    if ($this.status === STATUS.PENDING) {
      $this.status = STATUS.REJECTED;
      return $this.onRejected.apply(null, arguments);
    }
  }
}

PromiseTracking.prototype.catch = function _catch(onRejected) {
  this.onRejected = typeof onRejected  === 'function' ? onRejected : () => {};
  return this.promise.catch(_onRejected);

  //--------------------------------
  function _onRejected() {
    if ($this.status === STATUS.PENDING) {
      $this.status = STATUS.REJECTED;
      return $this.onRejected.apply(null, arguments);
    }
  }
}

//------------------------------------ UTILITIES ------------------------------------
function setTimeoutPromisified(applyback, timeout, thisArg, ...args) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        let result = undefined;
        if (typeof applyback === 'function') {
          result = applyback.apply(thisArg, args);
        }
        resolve(result);
      }
      catch (err) {
        reject(err);
      }
    }, timeout);
  });
}