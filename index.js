const isPlainObject = (value) => {
  if (Object.prototype.toString.call(value) !== "[object Object]") {
    return false;
  }

  const prototype = Reflect.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
};

export const {
  CIRCULAR_REFERENCE,
  TO_JSON_METHOD,
  INVALID_JSON_VALUE,
  NUMBER_NAN,
  NUMBER_INFINITE,
  RAW_JSON
} = new Proxy({}, { get: (_, code) => code });

const REASONS = {
  [CIRCULAR_REFERENCE]: "Circular reference found.",
  [TO_JSON_METHOD]: "Object with 'toJSON' method.",
  [INVALID_JSON_VALUE]: "Invalid JSON value.",
  [NUMBER_NAN]: "Invalid JSON value 'NaN'.",
  [NUMBER_INFINITE]: "Infinite number.",
  [RAW_JSON]: 'Raw JSON value found.'
};

class SafeJsonInspector {
  #references = new WeakSet();
  code;
  safe;
  path = [];

  constructor(value) {
    this.safe = this.#check(value);
  }

  #check(value) {
    if (
      typeof value === "string" ||
      typeof value === "boolean" ||
      value === null
    ) {
      return true;
    }

    if (typeof value === "number") {
      if (Number.isNaN(value)) {
        this.code = NUMBER_NAN;
        return false;
      }

      if (!Number.isFinite(value)) {
        this.code = NUMBER_INFINITE;
        return false;
      }

      return true;
    }

    const isArray = Array.isArray(value);
    const isObject = !isArray && isPlainObject(value);

    if (!isArray && !isObject) {
      this.code = INVALID_JSON_VALUE;
      return false;
    }

    const references = this.#references;
    if (references.has(value)) {
      this.code = CIRCULAR_REFERENCE;
      return false;
    }

    if (typeof value.toJSON === "function") {
      this.code = TO_JSON_METHOD;
      return false;
    }

    if (JSON.isRawJSON?.(value)) {
      this.code = RAW_JSON
      return false;
    }

    references.add(value);
    const entries = isArray ? value.entries() : Object.entries(value);
    const { path } = this;

    for (const [prototypeOrIndex, value] of entries) {
      path.push(prototypeOrIndex);

      if (!this.#check(value)) {
        return false;
      }

      path.pop();
    }

    return true;
  }

  get invalidReason() {
    return REASONS[this.code];
  }

  static check(value) {
    return new SafeJsonInspector(value);
  }
}

function isSafeJsonValue(value) {
  return SafeJsonInspector.check(value);
}

export default isSafeJsonValue;
