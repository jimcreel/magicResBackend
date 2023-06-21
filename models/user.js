const { Client } = require("pg");



const createUser = async (user) => {
	console.log('creating user')
    const client = new Client(process.env.DATABASE_URL);
    let query = 
        {
            text: `INSERT INTO USERS (email, password)
                VALUES ($1, $2)
                RETURNING id;`,
            values: [user.email, user.password]
        }
    await client.connect();
    try {
        const results = await client.query(query);
        return results.rows[0].id;
    } catch (err) {
        console.error("error executing query:", err);
        throw err;
    } finally {
        await client.end();
    }
    };



    const createUserRequest = async (requestId, userId) => {
        const client = new Client(process.env.DATABASE_URL);
        let query = {
          text: 'SELECT id FROM USERS_REQUEST WHERE user_id = $1 AND request_id = $2;',
          values: [userId, requestId]
        };
      
        await client.connect();
      
        try {
          const existingRequest = await client.query(query);
      
          if (existingRequest.rows.length > 0) {
            // A user_request with the same user_id and request_id already exists
            return null;
          }
      
          query = {
            text: 'INSERT INTO USERS_REQUEST (user_id, request_id, notification_count, method) VALUES ($1, $2, $3, $4) RETURNING id;',
            values: [userId, requestId, 0, 'email']
          };
      
          const results = await client.query(query);
          return results;
        } catch (err) {
          console.error('Error executing query:', err);
          throw err;
        } finally {
          await client.end();
        }
      };
      
  

const getUser = async (user) => {
    console.log(user)
    const client = new Client(process.env.DATABASE_URL);
    let query = 
    {
        text: ' SELECT * FROM USERS WHERE email = $1;',
        values: [user]
    }
            
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
    const client = new Client(process.env.DATABASE_URL);
    let query =
    {
        text: `SELECT * FROM USERS WHERE id = $1;`,
        values: [id]
    }

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

const getUserByHash = async (hash) => {
    const client = new Client(process.env.DATABASE_URL);
    let query =
    {
        text: `SELECT * FROM USERS WHERE passreset = $1;`,
        values: [hash]
    }
    
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
    console.log('getting user requests');
    const client = new Client(process.env.DATABASE_URL);
    let query =
    {
        text: `SELECT * FROM REQUEST
        WHERE id IN (SELECT request_id FROM USERS_REQUEST WHERE user_id = $1);`,
        values: [id]

    }
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


const editUser = async (user, id) => {
    
    const client = new Client(process.env.DATABASE_URL);
    let query = `UPDATE USERS SET`;
  
    const updateColumns = [];
  
    if (user.firstname) {
      updateColumns.push(`firstname = '${user.firstname}'`);
    }
  
    if (user.lastname) {
      updateColumns.push(`lastname = '${user.lastname}'`);
    }
  
    if (user.email) {
      updateColumns.push(`email = '${user.email}'`);
    }
  
    if (user.phone) {
      updateColumns.push(`phone = '${user.phone}'`);
    }
    
    if (user.defaultpass) {
        updateColumns.push(`defaultpass = '${user.defaultpass}'`);

    }

    if (user.defaultresort) {
        updateColumns.push(`defaultresort = '${user.defaultresort}'`);
    }   

    if (user.newPassword) {
        updateColumns.push(`password = '${user.newPassword}'`);
    }

    if (user.passReset) {
        updateColumns.push(`passreset = '${user.passReset}'`);
    }

    if (updateColumns.length === 0) {
        throw new Error("No valid fields to update");
    }
    else{

        query += ` ${updateColumns.join(', ')} WHERE id = '${id}' RETURNING id;`; 
        console.log(query);
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
}
  

module.exports = {
  createUser, getUser, getUserById, getUserRequests, editUser, createUserRequest, getUserByHash
};