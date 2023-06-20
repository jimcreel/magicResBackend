const { Client } = require("pg");

const client = new Client(process.env.DATABASE_URL);

const createUser = async (user) => {
    let query = 
            `   INSERT INTO USERS (email, password)
                VALUES ('${req.body.email}', '${req.body.password}');`
    await client.connect();
    try {
        const results = await client.query(query);
        return results;
    } catch (err) {
        console.error("error executing query:", err);
        throw err;
    } finally {
        await client.end();
    }
    };

const getUser = async (user) => {
    let query = 
            `   SELECT * FROM USERS
                WHERE email = '${user}';`
    await client.connect();
    try {
        const results = await client.query(query);
        return results;
    } catch (err) {
        console.error("error executing query:", err);
        throw err;
    } finally {
        await client.end();
    }

}

const getUserById = async (id) => {
    let query =
            `   SELECT * FROM USERS
                WHERE id = '${id}';`
    await client.connect();
    try {
        const results = await client.query(query);
        return results;
    } catch (err) {
        console.error("error executing query:", err);
        throw err;
    } finally {
        await client.end();
    }
}

const getUserRequests = async (id) => {
    let query =
            `   SELECT * FROM USERS_REQUEST
                WHERE user_id = '${id}';`
    await client.connect();
    try {
        const results = await client.query(query);
        return results;
    } catch (err) {
        console.error("error executing query:", err);
        throw err;
    } finally {
        await client.end();
    }
}

module.exports = {
  createUser, getUser, getUserById, getUserRequests
};
