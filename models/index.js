const { Client } = require("pg");



const createUser = async (user) => {
    const client = new Client(process.env.DATABASE_URL);
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
    const client = new Client(process.env.DATABASE_URL);
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
    const client = new Client(process.env.DATABASE_URL);
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
    const client = new Client(process.env.DATABASE_URL);
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

const editUser = async (user, id) => {
    console.log(user, id)
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

    if (updateColumns.length === 0) {
        throw new Error("No valid fields to update");
    }
    else{
        query += ` ${updateColumns.join(', ')} WHERE id = '${id}';`;
    
        await client.connect();
        try {
        const results = await client.query(query);
        const newUser = await client.query(`SELECT * FROM USERS WHERE id = '${id}';`)
        return newUser;
        } catch (err) {
        console.error("error executing query:", err);
        throw err;
        } finally {
        await client.end();
        }
    }
}
  

module.exports = {
  createUser, getUser, getUserById, getUserRequests, editUser
};
