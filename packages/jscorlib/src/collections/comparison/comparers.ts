import { Lazy } from "../../containers";
import { ArgumentNullError, InvalidOperationError, checkArgumentType } from "../../errors";
import { ClassTypeId, PrimitiveTypeId, TypeFromTypeId, TypeId, typeIdToString } from "../../types";
import { compareStringInvariant } from "./strings.intl";
import { ComparerFunction } from "./typing";

const lazyPrimitiveTypeComparerMap = new Lazy<{ [t in PrimitiveTypeId]?: ComparerFunction<TypeFromTypeId<t>> }>(() => ({
  string: (x, y) => compareStringInvariant(x, y),
  bigint: (x, y) => x > y ? 1 : x < y ? -1 : 0,
  boolean: (x, y) => {
    if (!x && y) return -1;
    if (x && !y) return 1;
    // if (x === y)
    return 0;
  },
  number: (x, y) => x > y ? 1 : x < y ? -1 : 0,
}));

const lazyClassInstanceComparerMap = new Lazy<WeakMap<ClassTypeId, ComparerFunction>>(() => {
  const map = new WeakMap<ClassTypeId, ComparerFunction>();
  map.set(Date, (x, y) => {
    checkArgumentType(0, "x", x, Date);
    checkArgumentType(1, "y", y, Date);

    const vx = x.getTime();
    const vy = y.getTime();
    if (vx > vy) return 1;
    if (vx < vy) return -1;
    return 0;
  });
  return map;
});

export function getComparer<TTypeId extends TypeId>(type: TypeId): ComparerFunction<TypeFromTypeId<TTypeId>> | undefined;
export function getComparer(type: TypeId): ComparerFunction | undefined;
export function getComparer(type: TypeId): ComparerFunction | undefined {
  if (!type) throw ArgumentNullError.create(0, "type");
  if (typeof type === "string") return lazyPrimitiveTypeComparerMap.value[type];
  return lazyClassInstanceComparerMap.value.get(type);
}

export function registerComparer<TTypeId extends ClassTypeId>(type: TTypeId, comparer: ComparerFunction<TypeFromTypeId<TTypeId>>): void;
export function registerComparer(type: ClassTypeId, comparer: ComparerFunction): void;
export function registerComparer(type: ClassTypeId, comparer: ComparerFunction): void {
  const map = lazyClassInstanceComparerMap.value;
  // For now we do not support overriding -- this will introduce dependency on registration order.
  if (map.has(type)) throw new InvalidOperationError(`A comparer has already been registered for ${typeIdToString(type)}.`);
  map.set(type, comparer);
}
