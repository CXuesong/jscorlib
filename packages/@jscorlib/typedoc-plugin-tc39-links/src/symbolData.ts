export const knownModules = new Set(["temporal-spec"]);
export const knownNamespaces = new Set(["Temporal"]);

export const symbolLinks: Record<string, string> = {
  "Temporal": "https://tc39.es/proposal-temporal/docs/",
  "Temporal.Duration": "https://tc39.es/proposal-temporal/docs/duration.html",
  "Temporal.Instant": "https://tc39.es/proposal-temporal/docs/instant.html",
  "Temporal.Now": "https://tc39.es/proposal-temporal/docs/now.html",
  "Temporal.PlainDateTime": "https://tc39.es/proposal-temporal/docs/plaindatetime.html",
  "Temporal.ZonedDateTime": "https://tc39.es/proposal-temporal/docs/zoneddatetime.html",
};
