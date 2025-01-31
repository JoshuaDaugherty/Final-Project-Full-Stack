import express from 'express';
import debug from 'debug';
import { GetAllUsers } from '../../database.js';
import { GetUserById } from '../../database.js';
import { addUser } from '../../database.js';
import { loginUser } from '../../database.js';
import { deleteUser } from '../../database.js';
import { updateUser } from '../../database.js';
import { userViewOwnProfile } from '../../database.js';
import { addEditRecord } from '../../database.js';
import { getUserByEmail } from '../../database.js';
import { addRecordToSaveChanges } from '../../database.js';
import { findRoleByName } from '../../database.js';
//import { userEditOwnProfile } from '../../database.js';
import Joi from 'joi';
import { ObjectId } from 'mongodb';
import { validBody } from '../../middleware/validBody.js';
import jwt from 'jsonwebtoken';
import { Collection } from 'mongodb';
import bcrypt from 'bcrypt';
import { isLoggedIn, hasAnyRole, hasRole, hasPermission} from '@merlin4/express-auth';
import { fetchRoles, mergePermissions } from '@merlin4/express-auth';


const debugUser  = debug('app:User ');

const router = express.Router();





// GET /api/user/list
router.get('/list', hasPermission('canViewData'), async (req, res) => {
  let match = {}; // match stage of the aggregation pipeline is the filter

  let { keywords, role, maxAge, minAge, pageSize, pageNumber, sortBy } = req.query;

  
      if (keywords) {
          match.$text = { $search: keywords };
      }

      if (role) {
          match.role = { $eq: role };
      }

      let sort = { givenName: 1, familyName: 1, createdDate: 1 };

      switch (sortBy) {
          case 'givenName':
              sort = { givenName: 1, familyName: 1, createdDate: 1 };
              break;
          case 'familyName':
              sort = { familyName: 1, givenName: 1, createdDate: 1 };
              break;
          case 'role':
              sort = { role: 1, givenName: 1, familyName: 1, createdDate: 1 };
              break;
          case 'newest':
              sort = { createdDate: -1 }; // descending order
              break;
          case 'oldest':
              sort = { createdDate: 1 };  // ascending order
              break;
          default:
               sort = { givenName: 1, familyName: 1, createdDate: 1 }; // Default sorting
      }

      pageNumber = Math.max(1, parseInt(pageNumber, 10) || 1);
      pageSize = Math.max(1, parseInt(pageSize, 10) || 5);

      const skip = (pageNumber - 1) * pageSize;
      const limit = pageSize;

      const today = new Date(); // get current date and time
      today.setHours(0);
      today.setMinutes(0);
      today.setSeconds(0);
      today.setMilliseconds(0);

      const pastMaximumDaysOld = new Date(today);
      pastMaximumDaysOld.setDate(pastMaximumDaysOld.getDate() - maxAge);

      const pastMinimumDaysOld = new Date(today);
      pastMinimumDaysOld.setDate(pastMinimumDaysOld.getDate() - minAge);

      if (maxAge && minAge) {
          match.createdOn = { $lte: pastMinimumDaysOld, $gte: pastMaximumDaysOld };
      } else if (minAge) {
          match.createdOn = { $lte: pastMinimumDaysOld };
      } else if (maxAge) {
          match.createdOn = { $gte: pastMaximumDaysOld };
      }

      const pipeline = [
        { $match: match },
        { $sort: sort },
        { $skip: skip },
        //{ $limit: limit }
      ];

      try{
        const user = await GetAllUsers(pipeline);
        res.status(200).json(user);
      }catch(error){
        debugUser(error);
      };
});



// GET /api/user/me
router.get('/me',  async (req, res) => {
  try {
    // Check if the user is logged in
    if (!req.auth) {
      return res.status(401).json({ error: 'Unauthorized: User not logged in' });
    }

    const userId = req.auth.id; // Get the current user's ID from the auth object

    // Validate the userId using Joi
    const { error } = validationSchema.validate(userId);
    if (error) {
      return res.status(404).json({ error: `User  ID ${userId} is not a valid ObjectId.` });
    }

    const user = await GetUserById(userId);
    if (!user) {
      return res.status(404).json({ error: `User  ${userId} not found.` });
    } else {
      // Exclude the password field from the user object
      const { password, ...userWithoutPassword } = user.toObject(); // Assuming user is a Mongoose document
      res.json(userWithoutPassword);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve user data' });
  }
});


// GET /api/user/:userId
router.get('/:userId', hasPermission('canViewData'), async (req, res) => {
  try {
    

    const userId = req.params.userId;

    // Validate the userId using Joi
    const validationSchema = Joi.string().required().custom((value) => {
      if (!ObjectId.isValid(value)) {
        throw new Error('Invalid ObjectId');
      }
      return value;
    });

    const { error } = validationSchema.validate(userId);
    if (error) {
      return res.status(404).json({ error: `User  ID ${userId} is not a valid ObjectId.` });
    }

    const user = await GetUserById(userId);
    if (!user) {
      return res.status(404).json({ error: `User  ${userId} not found.` });
    } else {
      res.json(user);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve user data' });
  }
});





//Define the user schema using Joi
const newUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  fullName: Joi.string().required(),
  givenName: Joi.string().required(),
  familyName: Joi.string().required(),
  role: Joi.string().required()
});

async function issueAuthToken(user){
 

  const roles = await fetchRoles(user, role => findRoleByName(role));
   // debugUser(roles)
   const permissions = mergePermissions(user, roles);
  //debugUser(permissions);
  const token = jwt.sign({_id:user._id,email: user.email, role:user.role, permissions:permissions }, process.env.JWT_SECRET, {expiresIn: '1h'});
  //debugUser(token);
  return token;
}

async function issueAuthCookie(res,token){
  const cookieOptions = {httpOnly:true, maxAge:1000*60*60, sameSite:'strict', secure:true};
  res.cookie('authToken', token, cookieOptions);
}


const roles = ['Developer', 'Business Analyst', 'Quality Analyst', 'Technical Manager','Product Manager'];

// POST /api/user/register
router.post('/register', validBody(newUserSchema), async (req, res) => {
  debugUser (`Route Hit`);
  const user = req.body;
  let existingUser  = null;

  try {
    existingUser  = await getUserByEmail(user.email);
  } catch (e) {
    debugUser (e);
    return res.status(500).json({ message: 'Error registering user' });
  }

  if (existingUser ) {
    return res.status(400).json({ message: 'User \'s email already exists' });
  } else {
    user.password = await bcrypt.hash(user.password, 10);

    // Ensure the role is valid
    if (user.role && typeof user.role === 'string') {
      if (roles.includes(user.role)) {
        user.role = [user.role]; // Wrap the role in an array
      } else {
        return res.status(400).json({ message: 'Invalid role selected' });
      }
    } else {
      user.role = []; // Default to an empty array if no role is provided
    }

    // Add createdOn field with the current date
    user.createdOn = new Date(); // Set the createdOn field to the current date

    // Call addUser  with the user object directly
    const insertUserResult = await addUser (user); // Pass the user object directly

    if (insertUserResult.acknowledged) {
      // Generate JWT
      const jwtToken = await issueAuthToken(user);

      // Create Auth Cookie
      await issueAuthCookie(res, jwtToken);
      return res.status(201).json({ message: 'User  registered successfully', role: user.role, email: user.email });
    } else {
      return res.status(500).json({ message: 'Error registering user' });
    }
  }
});


//hasPermission('canEditAnyUser'),
// Update the PATCH /api/user/:userId route
router.patch('/:userId', hasPermission('canEditAnyUser'), async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find the user by ID
    const user = await GetUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: `User  ${userId} not found.` });
    }
    
    debugUser (`About to hit Axios validate ${JSON.stringify(req.body)}`);

    // Update the user with the new values
    const updatedUser  = await updateUser (userId, req.body);

    if (!updatedUser ) {
      return res.status(400).json({ error: 'Failed to update user.' });
    }

    // Log the changes in the edits collection
    await addRecordToSaveChanges({
      timestamp: new Date(),
      col: "Users",
      op: "update",
      target: { userId },
      auth: req.auth
    });

    res.status(200).send({ message: `User  ${userId} updated!`, userId, updatedUser  });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});


// Update the PATCH /api/user/me route
router.patch('/me',  async (req, res) => {
  try {
    const userId = req.auth.id; // Get the current user's ID from the auth object
    const updates = req.body;

    // Validate the request body using Joi
    const { error: validationError } = userSchema.validate(updates);
    if (validationError) {
      return res.status(400).json({ error: validationError.details[0].message });
    }

    // Check if the updates include a role change
    if (updates.role) {
      return res.status(403).json({ error: 'You are not allowed to change your own role.' });
    }

    // Find the user by ID
    const user = await GetUserById(userId);
    if (!user) {
      return res.status(404).json({ error: `User  ${userId} not found.` });
    }

    // Update only provided fields
    Object.assign(user, updates);

    // Hash the password if it has changed
    if (updates.password) {
      user.password = await bcrypt.hash(updates.password, 10);
    }

    // Update lastUpdatedOn and lastUpdatedBy fields
    user.lastUpdatedOn = new Date();
    user.lastUpdatedBy = req.auth; // Assuming req.auth contains the necessary info

    await updateUser (user);

    // Add a record to the edits collection
    const changes = {};
    for (const key in updates) {
      if (updates.hasOwnProperty(key) && originalFields[key] !== updates[key]) {
        changes[key] = updates[key];
      }
    }

    await addRecordToSaveChanges({
      timestamp: new Date(),
      col: 'Users',
      op: 'update',
      target: { userId },
      update: changes,
      auth: req.auth,
    });

    // Generate a new JWT token with the updated information
    const jwtToken = await issueAuthToken(user);

    // Create a new Auth Cookie with the new token
    await issueAuthCookie(res, jwtToken);

    // Return a success response
    res.status(200).json({ message: `User  ${userId} updated!`, userId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});







// Define the login schema using Joi
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
});

// Update the POST /api/user/login route
router.post('/login', validBody(loginSchema), async (req, res) => {

  const user = req.body;

  try{
      const existingUser = await getUserByEmail(user.email);
      if(!existingUser){
        return res.status(200).json({message: 'Invalid email or password'});
      }
      const passwordMatch = await bcrypt.compare(user.password, existingUser.password);
      if(!passwordMatch){
        return res.status(200).json({message: 'Invalid email or password'});
      }
      const jwtToken = await issueAuthToken(existingUser);
      await issueAuthCookie(res, jwtToken);
      res.status(200).json(
        {
          message: 'User logged in successfully',
          role: existingUser.role,
          email: existingUser.email,
          token: jwtToken
        });
    }catch(e){
      debugUser(e);
      res.status(500).json({message: 'Error logging in user'});
    }
});

router.post('/logout', (req, res) => {

  res.clearCookie('authToken');
  res.status(200).json({message: 'User logged out successfully'});
});


// Define the validation schema for the userId
const validationSchema = Joi.string().required().custom((value) => {
  if (!ObjectId.isValid(value)) {
    throw new Error('Invalid ObjectId');
  }
  return value;
});

// Update the DELETE /api/user/:userId route
router.delete('/:userId', hasPermission('canEditAnyUser'), async (req, res) => {
  try {
    

    const userId = req.params.userId;

   

    const user = await GetUserById(userId);

    if (!user) {
      // If no user is found, return a 404 error
      return res.status(404).json({ error: `User  ${userId} not found.` });
    }
    
    // Remove the user from the database using deleteOne
    await deleteUser (userId);

    // Record the deletion in the edits collection
    const editRecord = {
      timestamp: new Date(),
      col: "user",
      op: "delete",
      target: { userId },
      auth: req.auth
    };
    await addRecordToSaveChanges(editRecord); // Assuming addEditRecord is a function to save the record

    // Send a success response
    res.status(200).json({ message: `User  ${userId} deleted!`, userId });
  } catch (error) {
    // Handle any database errors or promise rejections
    console.error(error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});



export { router as userRouter };