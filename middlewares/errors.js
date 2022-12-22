const errorHandler = require('../utils/errorHandler');

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';

    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            success: false,
            error: err,
            errMessage: err.message,
            stack: err.stack
        });
    }

    if (process.env.NODE_ENV === 'production') {
        let error = {...err};
        error.message = err.message;

        //Wrong mongoose object ID error
        if (err.name === 'CastError'){
            const message = `Resource not found. Invalid: ${err.path}`;
            error = new errorHandler(message, 404);
        }

        //Handling mongoose validation error
        if (err.name === 'ValidationError'){
            const message = Object.values(err.errors).map(value => value.message);
            error = new errorHandler(message, 400);
        }

        //Handling mongoose validation error
        if (err.code === 11000){
            const message = `Duplicate ${Object.keys(err.keyValue)} entered.`;
            error = new errorHandler(message, 400);
        }

        //Handling wrong JWT error
        if(err.name === 'JsonWebTokenError'){
            const message = 'JSON web token is invalid, try again.';
            error = new errorHandler(message, 500);
        }

        //Handling expired JWT error
        if(err.name === 'TokenExpiredError'){
            const message = 'JSON web token has expired, try again.';
            error = new errorHandler(message, 500);
        }

        res.status(error.statusCode).json({
            sucess: false,
            message: error.message || 'Internal Server Error.'
        });
    }
}