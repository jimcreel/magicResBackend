const { Client } = require("pg");

// create a new request and also a USER_REQUESTS entry

const createRequest = async (request, userId) => {
    let requestId
    const client = new Client(process.env.DATABASE_URL);
    let query =
            `   INSERT INTO REQUEST (resort, park, date)
                VALUES ('${request.resort}', '${request.park}', '${request.date}')
                RETURNING id;`
    await client.connect();
    try {
        const results = await client.query(query);
        console.log(results.rows[0].id)
        requestId = results.rows[0].id;
        
    }
    catch (err) {
        console.error("error executing query:", err);
        throw err;
    }
    finally {
        await client.end();
    }
    const client2 = new Client(process.env.DATABASE_URL);
    console.log(request)
    query = 
            `   INSERT INTO USERS_REQUEST (user_id, request_id, notification_count, method)
                VALUES ('${userId}', '${requestId}', 0, 'email');`
    await client2.connect();
    try {
        const results = await client2.query(query);
        return results;
    }
    catch (err) {
        console.error("error executing query:", err);
        throw err;
    }
    finally {
        await client2.end();
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
    const query = 
        ` SELECT id FROM REQUESTS
        WHERE resort = '${request.resort}', park = '${request.park}', date = '${request.date}';`
    await client.connect();
    try {
        const result = await client.query(query);
        console.log(result)
        
    } catch (err) {
        console.error('error executing query:', err);
        throw err;
    } finally {
        await client.end();
    }
}



module.exports = {
    createRequest, deleteRequest, getRequestId
}