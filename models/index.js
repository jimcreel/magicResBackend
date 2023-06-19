const { Client } = require("pg");

const client = new Client(process.env.DATABASE_URL);

const executeQuery = async (query) => {
  await client.connect();
  try {
    const results = await client.query(query);
    return results;
  } catch (err) {
    console.error("error executing query:", err);
    throw err;
  } finally {
    client.end();
  }
};

module.exports = {
  executeQuery,
};
