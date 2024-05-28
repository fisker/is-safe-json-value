import test from "node:test";
import assert from "node:assert/strict";
import isSafeJsonValue from "./index.js";

test(() => {
  assert(isSafeJsonValue("string").safe === true);
  assert(isSafeJsonValue(0).safe === true);
  assert(isSafeJsonValue(true).safe === true);
  assert(isSafeJsonValue(null).safe === true);
  assert(isSafeJsonValue([]).safe === true);
  assert(isSafeJsonValue({}).safe === true);
  assert(isSafeJsonValue(Object.create(null)).safe === true);
  assert(isSafeJsonValue({ toJSON: 1 }).safe === true);

  assert(isSafeJsonValue(NaN).safe === false);
  assert(isSafeJsonValue(new String("string")).safe === false);
  assert(isSafeJsonValue(new Number(0)).safe === false);
  assert(isSafeJsonValue(new Boolean(0)).safe === false);
  assert(isSafeJsonValue(undefined).safe === false);
  assert(isSafeJsonValue(Number.POSITIVE_INFINITY).safe === false);
  assert(isSafeJsonValue(new Date()).safe === false);
  assert(isSafeJsonValue({toJSON() {}}).safe === false);
  assert(isSafeJsonValue(BigInt(1)).safe === false);
  assert(isSafeJsonValue(Symbol('symbol')).safe === false);
  assert(isSafeJsonValue(Promise.resolve()).safe === false);

  const circularArray = [];
  circularArray.push(circularArray);
  assert(isSafeJsonValue(circularArray).safe === false);

  const circularObject = {};
  circularObject.circularObject = circularObject;
  assert(isSafeJsonValue(circularObject).safe === false);
});
