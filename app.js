const express = require("express");
const app = express();

//Setting up config.env file variables
const dotenv = require("dotenv");
const connectDatabase = require('./config/database');
const errorMiddleware = require('./middlewares/errors');
const errorHandler = require('./utils/errorHandler');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload')

dotenv.config({path: './config/config.env'});

//Handling uncaught exception
process.on('uncaughtException', err => {
    console.log(`Error: ${err.message}`);
    console.log('Shutting down due to uncaught exception.')
    process.exit(1);
})

//Connecting to database
connectDatabase();

//Setup body parser
app.use(express.json());

//Set cookie parser
app.use(cookieParser());

//Handle file uploads
app.use(fileUpload());

//Importing all routes
const jobs = require('./routes/jobs');
const auth = require('./routes/auth');
const user = require('./routes/user');

app.use(jobs);
app.use(auth);
app.use(user);

//Handle unhandled routes
app.all('*', (req, res, next) =>{
    next(new errorHandler(`${req.originalUrl} route not found`, 404));
});

//Middleware to handle errors
app.use(errorMiddleware);

const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
    console.log(`Server started on port ${process.env.PORT} in ${process.env.NODE_ENV} mode.`);
});

//Handling unhandled promise rejection
process.on('unhandledRejection', err => {
    console.log(`Error: ${ err.message }`);
    console.log('Shutting down the server due to unhandled promise rejection.');
    server.close( () =>{
        process.exit(1);
    });
});
