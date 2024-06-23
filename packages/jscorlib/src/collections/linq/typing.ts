/**
 * Represents a callback to determine whether the specified object in the sequence meets certain criteria.
 * 
 * @returns a truthy value indicates the item meets the criteria;
 * otherwise, the item does not meet the criteria.
 */
export type SequenceElementPredicate<T> = (item: T, index: number) => unknown;

/**
 * Represents a callback to determine whether the specified object in the sequence meets certain criteria.
 * This callback also shrinks the type of the input elements by type assertion.
 * 
 * @returns a truthy value indicates the item meets the criteria;
 * otherwise, the item does not meet the criteria.
 */
export type SequenceElementTypeAssertionPredicate<T, TReturn extends T> = (item: T, index: number) => item is TReturn;
