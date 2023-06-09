const { Client } = require('pg');

const client = new Client('postgres://localhost:5432/juicebox-dev');


async function createUser({ username, password, name, location }) {
  try {
    const {rows } = await client.query(`
      INSERT INTO users(username, password, name, location)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (username) DO NOTHING 
      RETURNING;
    `, [username, password, name, location]);

    return user;
  } catch (error) {
    throw error;
  }
}

async function getAllUsers() {
  try {
     const { rows } = await client.query(
      `SELECT id, username, name, location, active 
      FROM users;
    `);
  
   return rows;
  
   } catch (error) {
    throw error;
   }
  }
  
  // and export them
  module.exports = {
    client,
    createUser,
    getAllUsers,
    updateUser
   
}

async function updateUser(id, fields = {}) {
  
  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }"=$${ index + 1 }`
  ).join(', ');

  // return early if this is called without fields
  if (setString.length === 0) {
    return;
  }

  try {
    const { rows: [ user ]} = await client.query(`
      UPDATE users
      SET ${ setString }
      WHERE id=$${ id }
      RETURNING *;
    `, Object.values(fields));

    return user;
  } catch (error) {
    throw error;
  }
}


async function createPost({
  authorId,
  title, 
  content
}) {
  try {
   const { rows: [ post ] } = await client.query(`
     INSERT INTO posts("authorId", title, content)
     VALUES($1, $2, $3)
     RETURNING *;
   `, [authorId, title, content]);

   return post;

  } catch (error) {
    throw error;
  }
}

async function updatePost(id, fields = {}) {
  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }"=$${ index + 1 }`
  ).join(', ');

  if (setString.length === 0) {
    return;
  }
  
  
  try {
    const { rows: [ post ] } = await client.query(`
    UPDATE posts
    SET ${ setString }
    WHERE Id=${ id }
    RETURNING *;
    `, Object.values(fields));

    return post;
  } catch(error) {
    throw error;
  }
}

async function getPostsByUser(userId) {
  try {
    const { rows } = await client.query(`
      SELECT * 
      FROM posts
      WHERE "authorId"=${ userId };
    `, [userId]);

    return rows;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  client,
  createUser,
  updateUser,
  getAllUsers,
  getUserById,
  createPost,
  updatePost,
  getAllPosts,
  getPostsByUser
}

async function getUserById(userId) {
  try {
    const { rows: [ user ] } = await client.query(`
     SELECT id, username, name, location, active
     FROM users
     WHERE id=${ userId }
    `);

    if (!user) {
      return null
    }
    
    user.posts = await getPostsByUser(userId);

    return user;
  } catch (error) {
    throw error;
  }


}

async function getAllPosts() {
  try {
    const { rows } = await client.query(`
      SELECT *
      FROM posts;
    `);

    return rows;
  } catch (error) {
    throw error;
  }
}

async function gertUserByUsername(username) {
  try {
    const { rows: [user] } = await client.query(`
      SELECT *
      FROM users
      WHERE username=$1;
    `, [username]);

    return user;
  } catch (error) {
    throw error;
  }
}

async function createPost({
  authorId, 
  title,
  content,
  tags = []
}) {
  try {
    const { rows: [post] } = await client.query(`
      INSERT INTO posts("authorId", title, content)
      VALUES($1, $2, $3)
      RETURNING *;
    `, [authorId, title, content]);

    const tagList = await createTags(tags);

    return await addTagsToPost(post.id, tagList);
  } catch(error) {
    throw error;
  }
}


