import express from 'express';
import debug from 'debug';
import { GetAllBugs } from '../../database.js';
import { GetBugById } from '../../database.js';
import { addBug } from '../../database.js';
import { updateBug } from '../../database.js';
import { classifyBug } from '../../database.js';
import { assignBug } from '../../database.js';
import { closeBug } from '../../database.js';
import { addRecordToSaveChanges } from '../../database.js';
import { isLoggedIn, hasPermission} from '@merlin4/express-auth';
import { LogEdits } from '../../database.js';

import { ObjectId } from 'mongodb';
import { Collection } from 'mongodb';
import Joi from 'joi';



const debugBug = debug('app:Bug');

const router = express.Router();



//isLoggedIn(),hasPermission('canViewData'),

router.get('/listBugs', async (req, res) => {
  let match = {}; // match stage of the aggregation pipeline is the filter

  let {keywords, classification, maxAge, minAge, closed, sortBy, pageSize, pageNumber} = req.query

  
    if(keywords){
      match.$text = {$search: keywords};
    }

    if(classification){
      match.classification = {$eq: classification};
    }

    if(closed == 'true'){
      match.closed = {$eq: true};
    }else if(closed == 'false'){
      match.closed = {$eq: false};
    }

    let sort = { newest:1 };
    switch (sortBy) {
      case 'newest':
        sort = { createdDate: -1 }; // descending order
        break;
      case 'oldest':
        sort = { createdDate: 1 };  // ascending order
        break;
      case 'title':
        sort = { title: 1, createdDate: -1 }; // title ascending, created date descending
        break;
      case 'classification':
        sort = { classification: 1, createdDate: -1 }; // classification ascending, created date descending
        break;
      case 'assignedTo':
        sort = { assignedTo: 1, createdDate: -1 }; // assigned to name ascending, created date descending
        break;
      case 'createdBy':
        sort = { createdBy: 1, createdDate: -1 }; // created by name ascending, created date descending
        break;
      default:
        sort = { newest:1 }; // Default sorting
    }


    pageNumber = (1, parseInt(pageNumber, 10) || 1);
    pageSize = (1, parseInt(pageSize, 10) || 5); 
   
       const skip = (pageNumber - 1) * pageSize;
       const limit = pageSize;


       const today = new Date // get current date and time
       today.setHours(0);
       today.setMinutes(0);
       today.setSeconds(0);
       today.setMilliseconds(0);
       
       const pastMaximumDaysOld = new Date(today);
       pastMaximumDaysOld.setDate(pastMaximumDaysOld.getDate() - maxAge);
       
       const pastMinimumDaysOld = new Date(today);
       pastMinimumDaysOld.setDate(pastMinimumDaysOld.getDate() - minAge);
       
       if(maxAge && minAge){
       match.createdOn = {$lte:pastMinimumDaysOld, $gte:pastMaximumDaysOld};
       }
       else if(minAge){
         match.createdOn = {$lte: pastMinimumDaysOld};
       }
       else if(maxAge){
         match.createdOn = {$gte: pastMaximumDaysOld};
       };


    const pipeline = [
      { $match: match },
      { $sort: sort },
      { $skip: skip },
     // { $limit: limit }
    ];

    try{
      const bugs = await GetAllBugs(pipeline);
      res.status(200).json(bugs);
    }catch(error){
      debugBug(error);
    };

});


//isLoggedIn,hasPermission('canViewData'),
// ... previous code remains the same
router.get('/:bugId', hasPermission('canViewData'), async (req, res) => {
  try {
    const bugId = req.params.bugId;

    // Validate bugId using Joi
    const schema = Joi.string().required().alphanum().length(24);
    const validationResult = schema.validate(bugId);

    if (validationResult.error) {
      return res.status(404).json({ error: `Bug ${bugId} is not a valid ObjectId.` });
    }
    
    const bug = await GetBugById(bugId);
    if (!bug) {
      return res.status(404).json({ error: `Bug ${bugId} not found.` });
    } else {
      // Check if bug.comments is an array and sort it
      if (Array.isArray(bug.comments)) {
        const sortedComments = bug.comments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        bug.comments = sortedComments; // Update the bug object with sorted comments
      } else {
        // If comments is not an array, you can initialize it as an empty array or handle it as needed
        bug.comments = [];
      }
      res.json(bug);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve bug data' });
  }
});

//,isLoggedIn, hasPermission('canCreateBug')
router.post('/new', async (req, res) => {
  try {
    // Check if the user is logged in
    if (!req.auth) {
      return res.status(401).json({ error: 'Unauthorized: User not logged in' });
    }

    const { title, description, stepsToReproduce  } = req.body;

    // Define the validation schema using Joi
    const schema = Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required(),
      stepsToReproduce: Joi.string().required(),
      assignedTo: Joi.string().optional(), // Optional field
      comments: Joi.string().optional(), // Optional field
      classification: Joi.string().optional(), // Optional field
      closed: Joi.boolean().optional() // Optional field

    });

    // Validate the request data using the schema
    const validationResult = schema.validate(req.body);

    if (validationResult.error) {
      return res.status(400).json({ error: validationResult.error.details[0].message });
    }

    // Create an object with the required properties
    const bugData = {
      _id: new ObjectId(), // Generate a new unique ID using ObjectId from mongodb
      createdOn: new Date(), // Set current date
      createdBy: req.auth, // Information pulled from req.auth
      classification: "unclassified", // Set classification
      closed: false, // Set closed status
      title,
      description,
      stepsToReproduce,
    };

    // Add a new bug to the database
    const bugId = await addBug(bugData);

    // Record the change in the edits collection
    const editRecord = {
      timestamp: new Date(), // Current date
      col: "Bugs", // Collection name
      op: "insert", // Operation type
      target: { bugId }, // Target bug ID
      update: bugData, // The bug data that was inserted
      auth: req.auth, // User information from req.auth
    };

    await addRecordToSaveChanges(editRecord); // Assuming you have a function to add the edit record

    // Return a success response
    res.json({ message: 'New bug reported!', bugId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const updateBugSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  stepsToReproduce: Joi.string().required(),
  assignedTo: Joi.string().optional(),
  _id:Joi.string().required(),
  author:Joi.string().optional(),
  createdOn:Joi.date().optional(),
  classification:Joi.string().optional(),
  lastUpdated:Joi.date().optional(),
  resolvedDate:Joi.date().optional(),
  resolution:Joi.string().optional(),
  hoursLogged:Joi.string().optional(),
  softwareVersion:Joi.string().optional(),
  testCases:Joi.array().optional(),
  bugEdits:Joi.string().optional(),
});

router.patch('/:bugId',hasPermission('canEditAnyBug', 'canEditIfAssignedTo','canEditMyBug'), async (req, res) => {
  try {
    const bugId = req.params.bugId;

    // Validate bugId using Joi
    const bugIdSchema = Joi.string().required().alphanum().length(24);
    const validationResult = bugIdSchema.validate(bugId);

    if (validationResult.error) {
      return res.status(404).json({ error: `Bug ${bugId} is not a valid ObjectId.` });
    }

    // Find the bug by ID
    const bug = await GetBugById(bugId);
    
    if (!bug) {
      return res.status(404).json({ error: `Bug ${bugId} not found.` });
    }
    debugBug(`About to hit Axios validate ${JSON.stringify(req.body)}`);

    // Validate the request body against the updateBugSchema
    // const { error, value } = updateBugSchema.validate(req.body);
    // if (error) {
    //   return res.status(400).json({ error: 'Joi Validation Error' });
    // }

    // Prepare updates and track changes
    // const updates = {};
    // const changedFields = {};

    // Use validated values from the schema
    // if (value.title) {
    //   updates.title = value.title;
    //   changedFields.title = value.title;
    // }
    // if (value.description) {
    //   updates.description = value.description;
    //   changedFields.description = value.description;
    // }
    // if (value.stepsToReproduce) {
    //   updates.stepsToReproduce = value.stepsToReproduce;
    //   changedFields.stepsToReproduce = value.stepsToReproduce;
    // }

    // Update lastUpdatedOn and lastUpdatedBy
    // if (Object.keys(updates).length > 0) {
    //   updates.lastUpdatedOn = new Date();
    //   updates.lastUpdatedBy = req.auth; // Assuming req.auth contains user information
    // }

    // Update the bug with the new values
    await updateBug(req.body._id, req.body);

    // Log the changes in the edits collection
    await addRecordToSaveChanges({
      timestamp: new Date(),
      col: "Bugs",
      op: "update",
      target: { bugId },
      // update: changedFields,
      auth: req.auth
    });

    res.status(200).send({ message: `Bug ${bugId} updated!`, bugId });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});



router.patch('/:bugId/classify',isLoggedIn, hasPermission('canClassifyAnyBug','canEditIfAssignedTo','canEditMyBug'), async (req, res) => {
  try {
    // Check if the user is logged in
    if (!req.auth) {
      return res.status(401).json({ error: 'Unauthorized: User not logged in.' });
    }

    const bugId = req.params.bugId;

    // Validate bugId using Joi
    const schema = Joi.string().required().alphanum().length(24);
    const validationResult = schema.validate(bugId);

    if (validationResult.error) {
      return res.status(404).json({ error: `Bug ${bugId} is not a valid ObjectId.` });
    }

    const bug = await classifyBug(bugId);
    if (!bug) {
      return res.status(404).json({ error: `Bug ${bugId} not found.` });
    }

    const { classification } = req.body;

    // Define the validation schema for classification using Joi
    const classificationSchema = Joi.string().valid('bug', 'enhancement', 'feature');
    const classificationValidationResult = classificationSchema.validate(classification);

    if (classificationValidationResult.error) {
      return res.status(400).json({ error: 'Classification is required and must be one of: bug, enhancement, feature' });
    }

    const updates = {
      classification,
      classifiedOn: new Date(),
      classifiedBy: req.auth, // Information pulled from req.auth
      lastUpdated: new Date(),
    };

    // Update the bug with the new classification and other fields
    await classifyBug(bugId, updates);

    // Record the change in the edits collection
    const editRecord = {
      timestamp: new Date(),
      col: "Bugs",
      op: "update",
      target: { bugId },
      update: updates, // Fields that were changed and their new values
      auth: req.auth, // Information about the user who made the change
    };

    await addRecordToSaveChanges(editRecord); // Assuming you have a function to record edits

    res.status(200).send({ message: `Bug ${bugId} classified!`, bugId });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});




router.patch('/:bugId/assign',isLoggedIn(), hasPermission('canReassignAnyBug','canReassignIfAssignedTo','canEditMyBug'), async (req, res) => {
  try {
    // Check if the user is logged in
    if (!req.auth) {
      return res.status(401).json({ error: 'Unauthorized: User is not logged in.' });
    }

    const bugId = req.params.bugId;

    // Validate bugId using Joi
    const schema = Joi.string().required().alphanum().length(24);
    const validationResult = schema.validate(bugId);

    if (validationResult.error) {
      return res.status(404).json({ error: `Bug ${bugId} is not a valid ObjectId.` });
    }

    const bug = await assignBug(bugId);
    if (!bug) {
      return res.status(404).json({ error: `Bug ${bugId} not found.` });
    }

    const { assignedToUserId, assignedToUserName } = req.body;

    // Define the validation schema for assignedToUser Id and assignedToUser Name using Joi
    const userSchema = Joi.object({
      assignedToUserId: Joi.string().required().alphanum().length(24),
      assignedToUserName: Joi.string().required(),
    });

    const userValidationResult = userSchema.validate(req.body);

    if (userValidationResult.error) {
      return res.status(400).json({ error: userValidationResult.error.details[0].message });
    }

    const updates = {
      assignedToUserId,
      assignedToUserName,
      assignedOn: new Date(),
      assignedBy: req.auth, // Pulling information from req.auth
      lastUpdated: new Date(),
    };

    // Update the bug with the new fields
    await assignBug(bugId, updates);

    // Record the changes in the edits collection
    const editRecord = {
      timestamp: new Date(),
      col: "Bugs",
      op: "update",
      target: { bugId },
      update: updates,
      auth: req.auth,
    };

    // Assuming there's a function to save the edit record
    await addRecordToSaveChanges(editRecord);

    res.status(200).send({ message: `Bug ${bugId} assigned!`, bugId });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});




router.patch('/:bugId/close', hasPermission('canCloseAnyBug'), async (req, res) => {
  try {
    const bugId = req.params.bugId;

    const bug = await GetBugById(bugId);

    if (!bug) {
      // If no bug is found, return a 404 error
      return res.status(404).json({ error: `Bug ${bugId} not found.` });
    }
    
    // Update the bug to set closed: true (boolean)
    await updateBug(bugId, { closed: true }); // Set closed to true

    // Record the update in the edits collection
    const editRecord = {
      timestamp: new Date(),
      col: "Bugs",
      op: "close",
      target: { bugId },
      auth: req.auth
    };
    await addRecordToSaveChanges(editRecord); // Assuming addEditRecord is a function to save the record

    // Send a success response
    res.status(200).json({ message: `Bug ${bugId} closed!`, bugId });
  } catch (error) {
    // Handle any database errors or promise rejections
    console.error(error);
    res.status(500).json({ error: 'Failed to close bug' });
  }
});

export { router as bugRouter };