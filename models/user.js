const { Client } = require("pg");



const createUser = async (user) => {
	console.log('creating user')
    const client = new Client(process.env.DATABASE_URL);
    let query = 
            `   INSERT INTO USERS (email, password)
                VALUES ('${user.email}', '${user.password}')
				RETURNING id;`
    await client.connect();
    try {
        const results = await client.query(query);
		console.log(results)
        return results.rows[0].id;
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
    console.log('getting user requests');
    const client = new Client(process.env.DATABASE_URL);
    let query =
        `SELECT * FROM REQUEST
        WHERE id IN (SELECT request_id FROM USERS_REQUEST WHERE user_id = '${id}');`;
    await client.connect();
    try {
        const results = await client.query(query);
        console.log(results.rows);
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