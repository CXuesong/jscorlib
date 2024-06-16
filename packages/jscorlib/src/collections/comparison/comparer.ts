import { PrimitiveType, PrimitiveTypeMap, PrototypeHolder } from "../../types";
import { compareStringInvariant } from "./strings";
import { ComparerFunction } from "./typing";

const primitiveTypeComparerMap: { [t in PrimitiveType]?: ComparerFunction<PrimitiveTypeMap[t]> } = {
  string: (x, y) => compareStringInvariant(x, y),
  bigint: (x, y) => x > y ? 1 : x < y ? -1 : 0,
  boolean: (x, y) => {
    if (!x && y) return -1;
    if (x && !y) return 1;
    // if (x === y)
    return 0;
  },
  number: (x, y) => x > y ? 1 : x < y ? -1 : 0,
};

const prototypeIdComparerMap = new WeakMap<PrototypeHolder, ComparerFunction>();
