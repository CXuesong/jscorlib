/**
 * A nominal type alias of `number`, which is used to indicate the typed parameter will be
 * treated as an integer that
 * * is within the range of {@link !Number.isSafeInteger | safe integer},
 * i.e. from `-(2<sup>53</sup> - 1) to 2<sup>53</sup> - 1, inclusive (±9,007,199,254,740,991, or ±1FFFFF_FFFFFFFF);
 * * `-0` and `+0` are treated exactly the same (as "zero" `0`).
 */
export type SafeInteger = number;
