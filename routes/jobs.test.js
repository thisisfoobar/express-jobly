"use strict";

const request = require("supertest");

const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
  u1Token,
  adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/** POST /jobs */

describe("POST /jobs", function () {
  test("admin", async function () {
    const res = await request(app)
      .post("/jobs")
      .send({
        companyHandle: "c1",
        title: "newJob",
        salary: 15000,
        equity: "0.15",
      })
      .set("authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "newJob",
        salary: 15000,
        equity: "0.15",
        companyHandle: "c1",
      },
    });
  });

  test("non-admin", async function () {
    const res = await request(app)
      .post("/jobs")
      .send({
        companyHandle: "c1",
        title: "newJob",
        salary: 15000,
        equity: "0.15",
      })
      .set("authorization", `Bearer ${u1Token}`);

    expect(res.statusCode).toEqual(401);
  });

  test("missing data (job title)", async function () {
    const res = await request(app)
      .post("/jobs")
      .send({
        companyHandle: "c1",
        salary: 15000,
        equity: "0.15",
      })
      .set("authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(400);
  });
});

/** GET /jobs */

describe("GET /jobs", function () {
  test("get all jobs", async function () {
    const res = await request(app).get("/jobs");
    expect(res.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: "J1",
          salary: 1000,
          equity: "0.15",
          companyHandle: "c1",
          companyName: "C1",
        },
        {
          id: expect.any(Number),
          title: "J2",
          salary: 2000,
          equity: "0.1",
          companyHandle: "c1",
          companyName: "C1",
        },
        {
          id: expect.any(Number),
          title: "J3",
          salary: 3000,
          equity: null,
          companyHandle: "c2",
          companyName: "C2",
        },
      ],
    });
  });

  test("filtering", async function () {
    const res = await request(app)
      .get("/jobs")
      .query({ hasEquity: true, title: 1 });

    expect(res.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: "J1",
          salary: 1000,
          equity: "0.15",
          companyHandle: "c1",
          companyName: "C1",
        },
      ],
    });
  });

  test("bad filtering", async function () {
    const res = await request(app).get("/jobs").query({ bad: "whoops" });
    expect(res.statusCode).toEqual(400);
  });
});

/** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("get valid job", async function () {
    const res = await request(app).get(`/jobs/${testJobIds[0]}`);
    expect(res.body).toEqual({
      job: {
        id: testJobIds[0],
        title: "J1",
        salary: 1000,
        equity: "0.15",
        company: {
          handle: "c1",
          name: "C1",
          numEmployees: 1,
          description: "Desc1",
          logoUrl: "http://c1.img",
        },
      },
    });
  });

  test("invalid job id", async function () {
    const res = await request(app).get(`/job/1000`);
    expect(res.statusCode).toEqual(404);
  });
});

/** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works for admin", async function () {
    const res = await request(app)
      .patch(`/jobs/${testJobIds[0]}`)
      .send({
        title: "Updated Title",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(res.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "Updated Title",
        salary: 1000,
        equity: "0.15",
        companyHandle: "c1",
      },
    });
  });

  test("non-admin", async function () {
    const res = await request(app)
      .patch(`/jobs/${testJobIds[0]}`)
      .send({
        title: "I want to update",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(401);
  });

  test("invalid job id and data", async function () {
    const res = await request(app)
      .patch(`/jobs/10000`)
      .send({
        handle: "no job?",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(400);
  });
});

/** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function() {
    test("works for admin", async function () {
        const res = await request(app)
        .delete(`/jobs/${testJobIds[0]}`)
        .set("authorization", `Bearer ${adminToken}`)
        expect(res.body).toEqual({ deleted: testJobIds[0] })
    })

    test("non-admin", async function() {
        const res = await request(app)
        .delete(`/jobs/${testJobIds[0]}`)
        .set("authorization", `Bearer ${u1Token}`)
        expect(res.statusCode).toEqual(401)
    })

    test("invalid id", async function() {
        const res = await request(app)
        .delete(`/jobs/5000`)
        .set("authorization", `Bearer ${adminToken}`)
        expect(res.statusCode).toEqual(404)
    })
})