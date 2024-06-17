"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { Company } = require("./company");
/** Related functions for jobs. */

class Job {
  /** Create a new job
   *  requires input { title, salary, equity, company_handle }
   *
   *  Validates for duplicate jobs at a company
   *  Verify if company exists
   *
   *  Returns { title, salary, equity, company_handle }
   */
  static async create(data) {
    const result = await db.query(
      `INSERT INTO jobs
            (title, salary, equity, company_handle)
            VALUES ($1, $2, $3, $4)
            RETURNING id,title, salary, equity, company_handle AS "companyHandle"`,
      [data.title, data.salary, data.equity, data.companyHandle]
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs.
   *
   * Returns [{ title, salary, equity, company_handle}...]
   */

  static async findAll({ minSalary, hasEquity, title } = {}) {
    let query = `SELECT j.id, j.title, j.salary, j.equity, j.company_handle AS "companyHandle", c.name AS "companyName"
                FROM jobs j
                LEFT JOIN companies AS c ON c.handle = j.company_handle`;
    let whereExpressions = [];
    let queryValues = [];

    // Check through different search terms to see if any passed in
    if (minSalary !== undefined) {
      queryValues.push(minSalary);
      whereExpressions.push(`salary >= $${queryValues.length}`);
    }

    if (hasEquity === true) {
      whereExpressions.push(`equity > 0`);
    }

    if (title !== undefined) {
      queryValues.push(`%${title}%`);
      whereExpressions.push(`title ILIKE $${queryValues.length}`);
    }

    if (whereExpressions.length > 0) {
      query += " WHERE " + whereExpressions.join(" AND ");
    }

    query += " ORDER BY title";
    const jobsRes = await db.query(query, queryValues);

    return jobsRes.rows;
  }

  /** Filter job search
   * Filter by title, salary and equity
   *
   * Returns [{ title, salary, equity, company_handle}...]
   */

  /** Return specific job title from a company
   *
   * Need to provide {title, company_handle}
   */

  static async get(id) {
    const jobRes = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
        FROM jobs
        WHERE id = $1`,
      [id]
    );
    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job with ID: ${id}`);

    const companyRes = await db.query(
      `SELECT handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"
                                    FROM companies
                                    WHERE handle = $1`,
      [job.companyHandle]
    );

    delete job.companyHandle;
    job.company = companyRes.rows[0];
    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity}
   *
   * Returns {title, salary, equity, company_handle}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {});
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs
        SET ${setCols}
        WHERE id = ${handleVarIdx}
        RETURNING id, title, salary, equity, company_handle AS "companyHandle"`;

    const res = await db.query(querySql, [...values, id]);
    const job = res.rows[0];

    if (!job) throw new NotFoundError(`No job with ID: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(id) {
    const res = await db.query(
      `DELETE
      FROM jobs
      WHERE id = $1
      RETURNING id`,
      [id]
    );

    const job = res.rows[0];
    if (!job) throw new NotFoundError(`No job with ID: ${id}`)
  }
}

module.exports = Job;
