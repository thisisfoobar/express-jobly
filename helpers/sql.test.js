const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("./sql");

describe("partial update", function () {
  let data = {
    firstname: "Test1",
    lastname: "Test12",
    isAdmin: 0,
  };
  let noData = {
    firstname: "",
    lastname: "",
  };
  let jsonToSql = {
    firstname: "first_name",
    lastname: "last_name",
    isAdmin: "is_admin",
  };

  test("valid partial update", function () {
    const { setCols, values } = sqlForPartialUpdate(data, jsonToSql);
    expect(setCols).toBe(`"first_name"=$1, "last_name"=$2, "is_admin"=$3`);
    expect(values).toEqual(["Test1", "Test12", 0]);
  });

  test("missing values", function () {
    try {
      sqlForPartialUpdate("", jsonToSql);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});
