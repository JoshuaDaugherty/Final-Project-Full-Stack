

import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import debug from 'debug';
import { authMiddleware } from '@merlin4/express-auth';
import cookieParser from 'cookie-parser';
const debugServer = debug('app:Server');
import {userRouter} from './routes/api/user.js';
import {bugRouter} from './routes/api/bug.js';
import {connect} from './database.js';


import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

app.use(express.urlencoded({ extended: true}));

app.use(express.json());

app.use(express.static('frontend/dist'));

app.use(cors());


app.use(cookieParser());

app.use(authMiddleware(process.env.JWT_SECRET, 'authToken',{
  httpOnly:true,
  maxAge: 1000 * 60 * 60
}));

app.use('/api/user', userRouter);

app.use('/api/bug', bugRouter);

connect();



const port = process.env.PORT || 5000;

//Catch-all route to serve index.html in the /frontend/dist folder for React Router
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'));
})

app.listen(port,() =>{
  debugServer(`Server is running on port http://localhost:${port}`);
})

