import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.js'
import interviewRouter from './routes/interview.js';
import nodemailer from 'nodemailer'
const app = express();

dotenv.config();
app.use(cors());
app.use(express.json());
app.use('/',authRouter);
app.use('/',interviewRouter);

mongoose.connect(process.env.DB_URL)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB', err));


app.listen(process.env.PORT || 3000, () => {
    console.log('Server is running on port 3000');
});
