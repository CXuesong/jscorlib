const objectIdMap = new WeakMap<object, number>();
let nextId = 100;

export function getObjectId(obj: object): number {
  let id = objectIdMap.get(obj);
  if (id == null) {
    id = nextId;
    objectIdMap.set(obj, id);
    nextId++;
  }
  return id;
}
