const { Client } = require("pg");
const env = require("dotenv").config();

// create a new request and also a USER_REQUESTS entry

const getAllRequests = async () => {
    const client = new Client(process.env.DATABASE_URL);
    const query = 'SELECT * FROM REQUEST;';
    await client.connect();
    try {
        const result = await client.query(query);
        return result;
    } catch (err) {
        console.error('error executing query:', err);
        throw err;
    } finally {
        await client.end();
    }
};


const createRequest = async (request) => {
    const client = new Client(process.env.DATABASE_URL);
    
    const query = {
        text: 'INSERT INTO REQUEST (resort, park, date) VALUES ($1, $2, $3) RETURNING id;',
        values: [request.resort, request.park, request.date]
    }

    await client.connect();
    try {
        const results = await client.query(query);
        return results;
    }
    catch (err) {
        console.error("error executing query:", err);
        throw err;
    }
    finally {
        await client.end();
    }
}

const deleteRequest = async (requestId) => {
    const client = new Client(process.env.DATABASE_URL);
    const query = 'DELETE FROM USERS_REQUEST WHERE request_id = $1;';
    const values = [requestId];

    await client.connect();
    try {
        const result = await client.query(query, values);
        return result;

        
    } catch (err) {
        console.error('error executing query:', err);
        throw err;
    } finally {
        await client.end();
    }
};

const getRequestId = async (request) => {
    const client = new Client(process.env.DATABASE_URL);
    const query = {
        text: ' SELECT id FROM REQUEST WHERE resort = $1 AND park = $2 AND date = $3;',
        values: [request.resort, request.park, request.date]
    }   
    await client.connect();
    try {
        const result = await client.query(query);
        return result;
    } catch (err) {
        console.error('error executing query:', err);
        throw err;
    } finally {
        await client.end();
    }
}

const updateAvailability = async (requests) =>
const client = new Client(process.env.DATABASE_URL);
// toggle each request's availability to be true if false or false if true

await client.connect();
try {
    const result = await client.query(query);
    return result;
} catch (err) {
    console.error('error executing query:', err);
    throw err;
} finally {
    await client.end();
}
}


module.exports = {
    createRequest, deleteRequest, getRequestId, getAllRequests
}