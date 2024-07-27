import { describe, expect, it } from "vitest";
import * as Linq from "../index";
import * as Strings from "../../strings";

describe("LINQ comprehensive", () => {
  it("Word counting", () => {
    const text = `
It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief,
it was the epoch of incredulity, it was the season of Light, it was the season of Darkness, it was the spring of hope, it was the winter of despair,
…
    `;
    const words = text.match(/\w+/g)!;
    expect(Linq.asLinq(words).$_(Linq.count())).toBe(60);
    expect(Linq.asLinq(words).$_(Linq.min())).toBe("age");
    expect(Linq.asLinq(words).$_(Linq.minBy(w => w.length))).toBe("It");
    expect(Linq.asLinq(words).$_(Linq.max())).toBe("worst");
    expect(Linq.asLinq(words).$_(Linq.maxBy(w => w.length))).toBe("foolishness");

    expect(Linq.asLinq(words).$_(Linq.distinct()).$_(Linq.toArray())).toStrictEqual(
      "It was the best of times it worst age wisdom foolishness epoch belief incredulity season Light Darkness spring hope winter despair".split(" "),
    );

    expect(Linq.asLinq(words).$_(Linq.distinctBy(w => w.toLowerCase())).$_(Linq.toArray())).toStrictEqual(
      "It was the best of times worst age wisdom foolishness epoch belief incredulity season Light Darkness spring hope winter despair".split(" "),
    );

    expect(Linq.asLinq(words).$_(Linq.distinct()).$_(Linq.orderBy(w => w)).$_(Linq.toArray())).toStrictEqual(
      "age belief best Darkness despair epoch foolishness hope incredulity it It Light of season spring the times was winter wisdom worst".split(" "),
    );

    expect(
      Linq.asLinq(words)
        .$_(Linq.distinct())
        .$_(Linq.groupBy(w => w.length))
        .$_(Linq.orderBy(g => g.key))
        .$_(Linq.select(g => g.key + ": " + Strings.join(" ", g.values.$_(Linq.order()))))
        .$_(Linq.toArray()),
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
