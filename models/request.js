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

const toggleAvailability = async (requestIdList) => {
    // console.log(requestIdList)
    const client = new Client(process.env.DATABASE_URL);
    
    await client.connect();
    
    try {
      for (const requestId of requestIdList) {
        const query = {
          text: 'UPDATE REQUEST SET available = NOT available WHERE id = $1;',
          values: [requestId.id]
        };
        
        const result = await client.query(query);
      }
      
      return true; // or you can return a specific value indicating success
    } catch (err) {
      console.error('Error executing query:', err);
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
const getRequestById = async (requestId) => {
    const client = new Client(process.env.DATABASE_URL);
    const query = {
        text: 'SELECT * FROM REQUEST WHERE id = $1;',
        values: [requestId]
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



const getRequestUsers = async (requestId) => {
    const client = new Client(process.env.DATABASE_URL);
    const query = {
        text: `
            SELECT u.* 
            FROM users_request AS ur 
            JOIN users AS u ON ur.user_id = u.id
            WHERE ur.request_id = $1;
        `,
        values: [requestId]
    };
    await client.connect();
    try {
        const result = await client.query(query);
        // console.log(result.rows)
        return result.rows; // Return the rows of users from the result
    } catch (err) {
        console.error('error executing query:', err);
        throw err;
    } finally {
        await client.end();
    }
};











module.exports = {
    createRequest, deleteRequest, getRequestId, getAllRequests, toggleAvailability, getRequestById, getRequestUsers
}