import express from 'express';
import {GetBugById} from '../../../database.js';
import { GetUserById } from '../../../database.js';
import { getCommentById } from '../../../database.js';
import { addCommentToBug } from '../../../database.js';
import { updateBug } from '../../../database.js';
import { getAllCommentsByBug } from '../../../database.js';
import { validBody } from '../../middleware/validBody.js';
import { isLoggedIn, hasPermission} from '@merlin4/express-auth';
import { saveBug } from '../../../database.js';
import Joi from 'joi';
import {ObjectId} from 'mongodb';
import { Collection } from 'mongodb';
import debug from 'debug';
const debugComment =  debug('app:Comment')

const router = express.Router();



 //Define a schema to validate the request parameters
const bugIdSchema = Joi.object().keys({
  bugId: Joi.string().required()
});

// Get all comments for a given bug
router.get('/:bugId/comments',isLoggedIn(), validBody(bugIdSchema),hasPermission('canViewData'), async (req, res) => {
  try {
    // Check if the user is logged in (this is a simple example; adjust based on your auth logic)
    if (!req.user) { // Assuming req.user is set when a user is logged in
      return res.status(401).json({ message: 'Unauthorized: User not logged in' });
    }

    // Validate the request parameters
    const { error } = bugIdSchema.validate(req.params);
    if (error) {
      return res.status(400).json({ message: 'Invalid request parameters' });
    }

    const bugId = req.params.bugId;
    const comments = await getAllCommentsByBug(bugId);

    if (!comments) {
      return res.status(404).json({ message: 'No comments found for the given bug ID' });
    }

    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching comments' });
  }
});

//Get a specific comment

//Define the schema for validation
const schema = Joi.object({
  bugId: Joi.string().required(),
  commentId: Joi.string().required()
});

router.get('/:bugId/:commentId',isLoggedIn(), validBody(schema),hasPermission('canViewData'), async (req, res) => {
  const { bugId, commentId } = req.params;

  // Check if user is logged in (this is a placeholder, replace with your actual authentication logic)
  const isLoggedIn = req.isAuthenticated && req.isAuthenticated(); // Example check
  if (!isLoggedIn) {
    return res.status(401).json({ error: 'Unauthorized: User not logged in' });
  }

  // Validate parameters using Joi
  const { error } = schema.validate({ bugId, commentId });
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    // Retrieve comments for the specific bug
    const comments = await getAllCommentsByBug(bugId);
    
    if (!comments || comments.length === 0) {
      return res.status(404).json({ error: 'No comments found for this bug' });
    }

    // Find the specific comment by commentId
    const bugComment = comments.find(comment => comment.id === commentId);
    
    if (!bugComment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Return the specific comment if found
    res.status(200).json(bugComment);
  } catch (error) {
    // Handle server error
    res.status(500).send(error);
  }
});

//Add new comment
const commentSchema = Joi.object({
 comment: Joi.string().required(),
 commentAmount: Joi.number().optional(),
});

router.post('/bug/:bugId/comments', async (req, res) => {
  const { bugId } = req.params;
  const { commentText } = req.body;

  try {
      // Fetch the bug by ID
      const bug = await GetBugById(bugId);
      
      // Check if the bug exists
      if (!bug) {
          return res.status(404).send({ error: 'Bug not found' });
      }

      // Ensure comments is an array
      if (!Array.isArray(bug.comments)) {
          bug.comments = [];
      }

      // Add the new comment to the comments array
      bug.comments.push({ text: commentText, createdOn: new Date() });

      // Save the updated bug
      await saveBug(bug);

      res.status(200).send({ message: 'Comment added successfully' });
  } catch (error) {
      res.status(500).send({ error: error.message });
  }
});



export {router as commentRouter};