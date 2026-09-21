import * as dotenv from 'dotenv';
dotenv.config();


import { MongoClient, ObjectId } from "mongodb";
import debug from 'debug';
const debugDb = debug('app:Database');




/** Generate/Parse an ObjectId */
const newId = (str) => new ObjectId(str);

/** Global variable storing the open connection, do not use it directly. */
let _db = null;

/** Connect to the database */
async function connect() {
  if (!_db) {
    const dbUrl = process.env.DB_URL;
    const dbName = process.env.DB_NAME;
    const client = await MongoClient.connect(dbUrl);
    _db = client.db(dbName);
    debugDb('Connected.');
  }
  return _db;
}

/** Connect to the database and verify the connection */
async function ping() {
  const db = await connect();
  await db.command({ ping: 1 });
  debugDb('Ping.');
}

// FIXME: add more functions here

async function GetAllUsers(pipeline) {

  const db = await connect();
  return await db.collection('Users').aggregate(pipeline).toArray();
}

  async function GetAllBugs(pipeline) {
    const db = await connect();
    
    return await db.collection('Bugs').aggregate(pipeline).toArray();
  }
   
  

async function GetUserById(id){
  const db = await connect();
  const user = await db.collection('Users').findOne({_id: new ObjectId(id)});
  return user;
}

async function GetBugById(id){
  const db = await connect();
  const bug = await db.collection('Bugs').findOne({_id:  new ObjectId(id)});
  return bug;
}

async function addUser(user){
  const db = await connect();
  return await db.collection('Users').insertOne(user)
}

async function addBug(bug){
  const db = await connect();
  return await db.collection('Bugs').insertOne(bug)
}





  async function loginUser(email, password){
    const db = await connect();
    const user = await db.collection('Users').findOne({ email, password });
    return user;
  }

  async function deleteUser(userId){
    const db = await connect();
    return await db.collection('Users').deleteOne({_id: new ObjectId(userId)});
  }
  

  async function classifyBug(bug){
    const db = await connect();
    const dbResult = await db.collection('Bugs').updateOne({_id: new ObjectId(bug._id)}, {$set: {status: 'Closed', closedBy: bug.closedBy, closedAt: new Date()}});
    return dbResult;
  }

  async function assignBug(bug){
    const db = await connect();
    const dbResult = await db.collection('Bugs').updateOne({_id: new ObjectId(bug._id)}, {$set: {status: 'Assigned', assignedTo: bug.assignedTo, assignedAt: new Date()}});
    return dbResult;
  }

  async function updateUser(_id,updatedUser){
    delete updatedUser._id;  // remove _id field to prevent it from being updated
    const db = await connect();
    const dbResult = await db.collection('Users').updateOne({_id: new ObjectId(_id)}, {$set: updatedUser});
    return dbResult;
    };

  async function updateBug(_id, updatedBug){
    delete updatedBug._id;
    const db = await connect();
    const dbResult = await db.collection('Bugs').updateOne({_id: new ObjectId(_id)}, {$set: updatedBug});
    return dbResult;
    };

  async function closeBug(bug){
    const db = await connect();
    const dbResult = await db.collection('Bugs').updateOne({_id: new ObjectId(bug._id)}, {$set: {status: 'Closed'}});
    return dbResult;
  }
    

  async function addCommentToBug(bugId, commentText) {
    try {
      // Assuming you are using Mongoose and Bug is your model
      const result = await Bug.findByIdAndUpdate(
        bugId,
        { $push: { comments: commentText } }, // Push the comment string into the comments array
        { new: true } // Return the updated document
      );
  
      if (!result) {
        throw new Error('Bug not found');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error; // Rethrow the error to be handled in the route
    }
  }

  
  async function saveBug(comment){
    const db = await connect();
    return await db.collection('comments').insertOne(comment);
  }
    
    
  

  async function getCommentById(id){
    const db = await connect();
    const comment = await db.collection('comments').findOne({_id: new ObjectId(id)});
    return comment;
  }

  async function getAllComments(comment){
    const db = await connect();
    return await db.collection('comments').find({bugId: new ObjectId(comment)}).toArray();
  }

  async function getAllCommentsByBug(bugId){
    const db = await connect();
    return await db.collection('comments').find({bugId: new ObjectId(bugId)}).toArray();
  }

  async function getAllTestForBug(bugId){
    const db = await connect();
    return await db.collection('testCases').find({bugId: new ObjectId(bugId)}).toArray();
  }

  async function getTestById(bugId){
    const db = await connect();
    return await db.collection('testCases').findOne({_id: new ObjectId(bugId)});
  }

  async function addTest(test){
    const db = await connect();
    return await db.collection('testCases').insertOne(test);
  }

  async function deleteTest(testId){
    const db = await connect();
    return await db.collection('testCases').deleteOne({_id: new ObjectId(testId)});
  }

  async function updateTest(updatedTest){
    const db = await connect();
    const dbResult = await db.collection('testCases').updateOne({_id: new ObjectId(updatedTest._id)}, {$set: updatedTest});
    return dbResult;
  }

 async function userViewOwnProfile(user){
  const db = await connect();
  return await db.collection('Users').find({_id: new ObjectId(user._id)}).toArray();
 };

 async function userEditOwnProfile(user){
  const db = await connect();
  const dbResult = await db.collection('Users').updateOne({_id: new ObjectId(user._id)}, {$set: user});
  return dbResult;
 };

 async function addEditRecord(user, record) {
  const db = await connect();
  const dbResult = await db.collection('Users').updateOne({_id: new ObjectId(user._id)}, {$push: {editRecords: record}});
  return dbResult;
 };

 async function getUserByEmail(email) {
  const db = await connect();
  return await db.collection('Users').findOne({email});
  
 };

 async function addRecordToSaveChanges(record) {
  const db = await connect();
  const dbResult = await db.collection('Record').insertOne(record);
  return dbResult;
 };

 async function findRoleByName(roleName){
  const db = await connect();
  const role=  await db.collection('Role').findOne({name: roleName});
  return role;
 }

 async function LogEdits(record){
  const db = await connect();
  const dbResult = await db.collection('Record').insertOne(record);
  return dbResult;
 }


// export functions
export {
  newId,
  connect,
  ping,
  // FIXME: remember to export your functions
  GetAllUsers,
  GetAllBugs,
  GetUserById,
  GetBugById,
  addUser,
  addBug,
  updateUser,
  updateBug,
  loginUser,
  deleteUser,
  classifyBug,
  assignBug,
  closeBug,
  addCommentToBug,
  getCommentById,
  getAllComments,
  getAllCommentsByBug,
  getAllTestForBug,
  getTestById,
  addTest,
  deleteTest,
  updateTest,
  userViewOwnProfile,
  userEditOwnProfile,
  addEditRecord,
  getUserByEmail,
  addRecordToSaveChanges,
  findRoleByName,
  LogEdits,
  saveBug
};

// test the database connection
ping();