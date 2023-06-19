require('dotenv').config()
const { Client } = require("pg");

const client = new Client(process.env.DATABASE_URL);

// create the user table in the database using postgres

(async () => {
  await client.connect();
  try {
    // const results = await client.query(
    //     `CREATE TABLE IF NOT EXISTS REQUEST (
    //     id SERIAL PRIMARY KEY,
    //     resort VARCHAR(150) NOT NULL,
    //     park VARCHAR(150) NOT NULL,
    //     date VARCHAR(150) NOT NULL
    // );`
    // );
    // const results = await client.query(
    //     `INSERT INTO REQUEST (resort, park, date)
    //     VALUES ('WDW', 'MK', '2021-07-01');`
    // );
    // const results = await client.query(
    //     `SELECT * FROM REQUEST;`
    // );
    // const results = await client.query(
    //     `CREATE TABLE IF NOT EXISTS USERS_REQUEST (
    //     id SERIAL PRIMARY KEY,
    //     user_id INTEGER references USERS(id),
    //     request_id INTEGER references REQUEST(id),
    //     notification_count INTEGER NOT NULL,
    //     method VARCHAR(150) NOT NULL
    // );`
        // `INSERT INTO USERS_REQUEST (user_id, request_id, notification_count, method)
        // VALUES (875372176713023489,875373187851976705, 0, 'email');`
        // )
    // const results = await client.query(
    //     `INSERT INTO REQUEST (firstname, lastname, pass, email, phone)
    //     VALUES ('Jim', 'Creel', 'inspire-key-pass', 'jim.creel@gmail.com', '6822020495');`
    // );

    const results = await client.query(
        `SELECT * FROM USERS;`
    );
    // const results = await client.query(
    //     `ALTER TABLE USERS
    //     ADD COLUMN password VARCHAR(150),
    //     ADD COLUMN passreset VARCHAR(150);`
    //   );
    // const results = await client.query(`DROP TABLE USERS;`)
    // const results = await client.query(
    //     `CREATE TABLE IF NOT EXISTS USERS (
    //     id SERIAL PRIMARY KEY,
    //     firstname VARCHAR(150) NOT NULL,
    //     lastname VARCHAR(150) NOT NULL,
    //     pass VARCHAR(150) NOT NULL,
    //     email VARCHAR(150) NOT NULL UNIQUE,
    //     phone VARCHAR(150) NOT NULL UNIQUE,
    //     password VARCHAR(150),
    //     passreset VARCHAR(150)
    // );`
    // )
      

    console.log(results.rows);
  } catch (err) {
    console.error("error executing query:", err);
  } finally {
    client.end();
  }
})();
