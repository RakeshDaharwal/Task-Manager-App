const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const app = express();
const Router = require('./Router/routes')
const cookieParser = require('cookie-parser');
const rateLimitMiddleware = require('./Middleware/rateLimitMiddleware');

dotenv.config();

// Middleware

app.use(express.json());  
app.use(cookieParser());

app.use(cors({
    origin: ['https://taskmaster-io.netlify.app', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }));



app.use(rateLimitMiddleware);
app.use('/', Router);

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
    console.log(`Server is Running on Port ${PORT}`)
})
