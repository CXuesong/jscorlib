import { describe, expect, it } from "vitest";
import * as Linq from "../../index";
import * as Strings from "../../../strings";

describe("LINQ comprehensive", () => {
  it("Word counting", () => {
    const text = `
It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief,
it was the epoch of incredulity, it was the season of Light, it was the season of Darkness, it was the spring of hope, it was the winter of despair,
…
    `;
    const words = text.match(/\w+/g)!;
    expect(Linq.asLinq(words).$(Linq.count())).toBe(60);
    expect(Linq.asLinq(words).$(Linq.min())).toBe("age");
    expect(Linq.asLinq(words).$(Linq.minBy(w => w.length))).toBe("It");
    expect(Linq.asLinq(words).$(Linq.max())).toBe("worst");
    expect(Linq.asLinq(words).$(Linq.maxBy(w => w.length))).toBe("foolishness");

    expect(Linq.asLinq(words).$(Linq.distinct()).$(Linq.toArray())).toStrictEqual(
      "It was the best of times it worst age wisdom foolishness epoch belief incredulity season Light Darkness spring hope winter despair".split(" "),
    );

    expect(Linq.asLinq(words).$(Linq.distinctBy(w => w.toLowerCase())).$(Linq.toArray())).toStrictEqual(
      "It was the best of times worst age wisdom foolishness epoch belief incredulity season Light Darkness spring hope winter despair".split(" "),
    );

    expect(Linq.asLinq(words).$(Linq.distinct()).$(Linq.orderBy(w => w)).$(Linq.toArray())).toStrictEqual(
      "age belief best Darkness despair epoch foolishness hope incredulity it It Light of season spring the times was winter wisdom worst".split(" "),
    );

    expect(
      Linq.asLinq(words)
        .$(Linq.distinct())
        .$(Linq.groupBy(w => w.length))
        .$(Linq.orderBy(g => g.key))
        .$(Linq.select(g => g.key + ": " + Strings.join(" ", g.values.$(Linq.order()))))
        .$(Linq.toArray()),
    ).toStrictEqual([
      "2: it It of",
      "3: age the was",
      "4: best hope",
      "5: epoch Light times worst",
      "6: belief season spring winter wisdom",
      "7: despair",
      "8: Darkness",
      "11: foolishness incredulity",
    ]);
  });
});
