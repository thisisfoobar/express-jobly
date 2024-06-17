const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db");
const Job = require("./job");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterAll,
  commonAfterEach,
  testJobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/** Test creating new job */

describe("create", function () {
  let newJob = {
    companyHandle: "c2",
    title: "Test Job",
    salary: 55555,
    equity: "0.13",
  };

  test("new job", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
      ...newJob,
      id: expect.any(Number),
    });
  });
});

/** Testing findAll search */

describe("findAll", function () {
  test("no filter, return all jobs", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: testJobIds[0],
        title: "J1",
        salary: 1000,
        equity: "0.15",
        companyHandle: "c1",
        companyName: "C1",
      },
      {
        id: testJobIds[1],
        title: "J2",
        salary: 2000,
        equity: "0.1",
        companyHandle: "c1",
        companyName: "C1",
      },
      {
        id: testJobIds[2],
        title: "J3",
        salary: 3000,
        equity: "0",
        companyHandle: "c2",
        companyName: "C2",
      },
      {
        id: testJobIds[3],
        title: "J4",
        salary: null,
        equity: null,
        companyHandle: "c2",
        companyName: "C2",
      },
    ]);
  });
  test("filter minSalary", async function () {
    let jobs = await Job.findAll({ minSalary: 2500 });
    expect(jobs).toEqual([
      {
        id: testJobIds[2],
        title: "J3",
        salary: 3000,
        equity: "0",
        companyHandle: "c2",
        companyName: "C2",
      },
    ]);
  });

  test("filter equity", async function () {
    let jobs = await Job.findAll({ hasEquity: true });
    expect(jobs).toEqual([
      {
        id: testJobIds[0],
        title: "J1",
        salary: 1000,
        equity: "0.15",
        companyHandle: "c1",
        companyName: "C1",
      },
      {
        id: testJobIds[1],
        title: "J2",
        salary: 2000,
        equity: "0.1",
        companyHandle: "c1",
        companyName: "C1",
      },
    ]);
  });

  test("filter min salary & equity", async function () {
    let jobs = await Job.findAll({ minSalary: 1500, hasEquity: true });
    expect(jobs).toEqual([
      {
        id: testJobIds[1],
        title: "J2",
        salary: 2000,
        equity: "0.1",
        companyHandle: "c1",
        companyName: "C1",
      },
    ]);
  });

  test("filter partial name", async function () {
    let jobs = await Job.findAll({ title: "1" });
    expect(jobs).toEqual([
      {
        id: testJobIds[0],
        title: "J1",
        salary: 1000,
        equity: "0.15",
        companyHandle: "c1",
        companyName: "C1",
      },
    ]);
  });

  /** get single job by id */
  describe("get", function () {
    test("get single job by id", async function () {
      let job = await Job.get(testJobIds[0]);
      expect(job).toEqual({
        id: testJobIds[0],
        title: "J1",
        salary: 1000,
        equity: "0.15",
        company: {
          handle: "c1",
          name: "C1",
          description: "Desc1",
          numEmployees: 1,
          logoUrl: "http://c1.img",
        },
      });
    });
  });

  test("bad id", async function () {
    try {
      await Job.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  /** update job by id */
  describe("update", function () {
    let updateData = {
      title: "updated",
      salary: 50000,
      equity: "0.55",
    };
    test("update job by id", async function () {
      let job = await Job.update(testJobIds[0], updateData);
      expect(job).toEqual({
        id: testJobIds[0],
        companyHandle: "c1",
        ...updateData,
      });
    });

    test("bad id", async function () {
      try {
        await Job.update(0, {});
        fail();
      } catch (err) {
        expect(err instanceof BadRequestError).toBeTruthy();
      }
    });
  });

  /** remove by id */
  describe("remove", function () {
    test("remove by id", async function () {
      await Job.remove(testJobIds[0]);
      const res = await db.query(`SELECT id FROM jobs WHERE id=$1`, [testJobIds[0]]);
      expect(res.rows.length).toEqual(0);
    });

    test("bad id", async function () {
        try {
            await Job.remove(0)
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    })
  });
});
