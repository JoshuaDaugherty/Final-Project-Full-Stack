import express from 'express';
import {ObjectId} from 'mongodb';
import { updateBug } from '../../database.js';
import { getAllTestForBug } from '../../database.js';
import { getTestById } from '../../database.js';
import { addTest } from '../../database.js';
import { updateTest } from '../../database.js';
import { deleteTest } from '../../database.js';
import { GetBugById } from '../../database.js';
import { validBody } from '../../middleware/validBody.js';
import { isLoggedIn, hasPermission} from '@merlin4/express-auth';

import Joi from 'joi';
import debug from 'debug';

const debugTestCases =  debug('app:testCases')
const debugBug = debug('app:bug')

const router = express.Router();

//get all test cases for bugId
router.get('/:bugId/tests',hasPermission('canViewData'), async (req, res) => {
  try {
   

    // Define a Joi schema to validate the bugId parameter
    const schema = Joi.object().keys({
      bugId: Joi.string().required()
    });

    // Validate the request parameters
    const { error } = schema.validate(req.params);
    if (error) {
      return res.status(400).json({ error: 'Invalid request parameters' });
    }

    // Extract the validated bugId from the request parameters
    const { bugId } = req.params;

    // Retrieve test cases for the specified bug
    const testCases = await getAllTestForBug(bugId);

    // Check if test cases were found
    if (!testCases) {
      return res.status(404).json({ error: 'Test cases not found for bug' });
    }

    // Log test cases for debugging purposes
    debugTestCases(testCases);

    // Return test cases in JSON format
    res.json(testCases);
  } catch (error) {
    // Log error for debugging purposes
    console.error(error);

    // Return a 500 error response with a JSON error message
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//get test case by id

router.get('/:bugId/tests/:testId',isLoggedIn(),hasPermission('canViewData'), async (req, res) => {
  try {
    // Define a Joi schema to validate the bugId and testId parameters
    const schema = Joi.object().keys({
      bugId: Joi.string().required(),
      testId: Joi.string().required()
    });

    // Validate the request parameters
    const { error } = schema.validate(req.params);
    if (error) {
      return res.status(400).json({ error: 'Invalid request parameters' });
    }

    // Extract the validated bugId and testId from the request parameters
    const { bugId, testId } = req.params;

    // Check if the testId is a valid ObjectId
    if (!ObjectId.isValid(testId)) {
      return res.status(400).json({ error: 'Invalid test ID' });
    }

    // Retrieve test case for the specified testId
    const testCase = await getTestById(testId);
    
    // Check if test case was found
    if (!testCase) {
      return res.status(404).json({ error: 'Test case not found for bug' });
    }
    
    // Log test case for debugging purposes
    debugTestCases(testCase);
    
    // Return test case in JSON format
    res.json(testCase);
  } catch (error) {
    // Log error for debugging purposes
    console.error(error);
    
    // Return a 500 error response with a JSON error message
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//add new test case

//Define the schema for validating the request data
const testCaseSchema = Joi.object({
  status: Joi.string().valid('pass', 'fail').required(),
 addedBy: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
});

router.post('/:bugId/tests',isLoggedIn(), validBody(testCaseSchema),hasPermission('canAddTestCase'), async (req, res) => {
  const { bugId } = req.params;

  // Check if the user is logged in
  if (!req.user) { // Assuming req.user is set when a user is authenticated
    return res.status(401).json({ error: 'User  not logged in' });
  }

  // Validate the request body
  const { error } = testCaseSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    // Get the bug
    const bug = await GetBugById(bugId);
    debugTestCases(`Bug: ${JSON.stringify(bug)}`);

    debugTestCases(`req.body: ${JSON.stringify(req.body)}`);

    // Set createdOn and createdBy fields
    const testCaseData = {
      ...req.body,
      createdOn: new Date(), // Current timestamp
      createdBy: req.user.id // Assuming the user's ID is stored in req.user
    };

    // Create a new test case in testCase Collection
    const testCase = await addTest(testCaseData);
    debugTestCases(`Test created: ${JSON.stringify(testCase)}`);

    // Add testCase to Array
    bug.testCases.push(testCase.insertedId);

    // Update Bug
    const updatedBug = await updateBug(bug);
    debugTestCases(`Bug updated: ${JSON.stringify(updatedBug)}`);

    // Add a record to the edits collection
    await addEditRecord({
      bugId: bugId,
      testCaseId: testCase.insertedId,
      editedBy: req.user.id,
      editedOn: new Date()
    });

    // Return the created test case
    res.status(200).json(testCase);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


//update test case
router.patch('/:bugId/tests/:testId',isLoggedIn(),hasPermission('canEditTestCase'), async (req, res) => {
  try {
    const { bugId, testId } = req.params;

    // Check if user is logged in
    const { userId } = req.body;
    if (!userId) {
      return res.status(401).json({ message: 'User  not logged in' });
    }

    // Validate the request data using Joi
    const { error } = testCaseSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: 'Invalid request data', error: error.details[0].message });
    }

    // Extract the status from the request body
    const { status } = req.body;

    // Prepare the update object with additional fields
    const updateData = {
      status,
      lastUpdatedOn: new Date(), // Set the current date and time
      lastUpdatedBy: userId, // Set the userId of the user making the request
    };

    // Update the test case in the database
    const updatedTestCase = await updateTest(bugId, testId, updateData);

    // If the test case is not found, return a 404 error
    if (!updatedTestCase) {
      return res.status(404).json({ message: 'Test case not found' });
    }

    // Add a record to the edits collection to track changes
    await addEditRecord(bugId, testId, userId, updateData);

    // Return the updated test case as a JSON response
    res.status(200).json(updatedTestCase);
  } catch (error) {
    // Catch any database errors or promise rejections and return a 500 error
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//delete test case

router.delete('/:bugId/tests/:testId',isLoggedIn(),hasPermission('canDeleteTestCase'), async (req, res) => {
  try {
    // Check if the user is logged in
    if (!req.user) { // Assuming req.user is set if the user is logged in
      return res.status(401).json({ message: 'Unauthorized: User not logged in' });
    }

    // Extract the bugId and testId from the URL parameters
    const { bugId, testId } = req.params;

    // Delete the test case from the database
    const deletedTestCase = await deleteTest(bugId, testId);

    // If the test case is not found, return a 404 error
    if (!deletedTestCase) {
      return res.status(404).json({ message: 'Test case not found' });
    }

    // Record the deletion in the edits collection
    await recordEdit({
      action: 'delete',
      bugId: bugId,
      testId: testId,
      userId: req.user.id, // Assuming req.user contains the user's ID
      timestamp: new Date()
    });

    // Return a 204 No Content response
    res.status(204).send();
  } catch (error) {
    // Catch any database errors or promise rejections and return a 500 error
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



export {router as testCasesRouter};
