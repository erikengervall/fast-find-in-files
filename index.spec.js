const { superSearchWrapper } = require("./index");

describe("does it trabajo", () => {
  it("sure does", () => {
    expect(superSearchWrapper()).toMatchInlineSnapshot(
      `"ran pretty good i'd say :-D"`
    );
  });
});
