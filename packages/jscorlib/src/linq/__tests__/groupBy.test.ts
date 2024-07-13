import { describe, expect, it } from "vitest";
import * as GroupBy from "../groupBy";
import { asLinq, registerLinqModule } from "../linqWrapper";

registerLinqModule(GroupBy);

describe("groupBy", () => {
  it("groupBy", () => {
    // A list of names pulled from New Bing.
    const names = [
      "James Smith",
      "Michael Smith",
      "Robert Smith",
      "Maria Garcia",
      "David Smith",
      "Maria Rodriguez",
      "Mary Smith",
      "Maria Hernandez",
      "Maria Martinez",
      "Robert Johnson",
    ];
    const byFirstName = asLinq(names).groupBy(n => n.split(" ")[0]);
    const byLastName = asLinq(names).groupBy(n => n.split(" ")[1]);
    expect(new Set(byFirstName)).toEqual(new Set([
      { "key": "James", "values": ["James Smith"] },
      { "key": "Michael", "values": ["Michael Smith"] },
      { "key": "Robert", "values": ["Robert Smith", "Robert Johnson"] },
      { "key": "Maria", "values": ["Maria Garcia", "Maria Rodriguez", "Maria Hernandez", "Maria Martinez"] },
      { "key": "David", "values": ["David Smith"] },
      { "key": "Mary", "values": ["Mary Smith"] },
    ]));
    expect(new Set(byLastName)).toEqual(new Set([
      { "key": "Smith", "values": ["James Smith", "Michael Smith", "Robert Smith", "David Smith", "Mary Smith"] },
      { "key": "Garcia", "values": ["Maria Garcia"] },
      { "key": "Rodriguez", "values": ["Maria Rodriguez"] },
      { "key": "Hernandez", "values": ["Maria Hernandez"] },
      { "key": "Martinez", "values": ["Maria Martinez"] },
      { "key": "Johnson", "values": ["Robert Johnson"] },
    ]));
  });
});

