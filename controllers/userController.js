const User = require('../models/users');
const Job = require('../models/jobs');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const errorHandler = require('../utils/errorHandler');
const sendToken = require('../utils/jwtToken');
const fs = require('fs');
const APIFilters = require('../utils/apiFilters');

//Get current user profile => /api/v1/user
exports.getUserProfile = catchAsyncErrors(async(req, res, next) => {
    const user = await User.findById(req.user.id).populate({ path: 'jobsPublished', select: 'title postingDate' });

    res.status(200).json({
        success: true,
        data: user
    });
});

//Update current user password => /api/v1/user/password
exports.updatePassword = catchAsyncErrors(async(req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    //Check previous user password
    const isMatched = await user.comparePassword(req.body.currentPassword);
    if (!isMatched){
        return next(new errorHandler('Old password is incorrect', 401));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendToken(user, 200, res);
});

//Update current user data => /api/v1/user/update
exports.updateUser = catchAsyncErrors(async(req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: user
    });
});

//Delete current user => /api/v1/user/delete
exports.deleteUser = catchAsyncErrors(async(req, res, next) => {
    deleteUserData(req.user.id, req.user.role);
    const user = await User.findByIdAndDelete(req.user.id);

    res.cookie('token', 'none', {
        maxAge: Date.now(),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: 'Your account has been deleted'
    });
});

//Show all applied jobs => /api/v1/user/jobs/applied
exports.getAppliedJobs = catchAsyncErrors(async(req, res, next) => {
    const jobs = await Job.find({ 'applicantsApplied.id': req.user.id }).select('+applicantsApplied');

    res.status(200).json({
        success: true,
        results: jobs.length,
        data: jobs
    });
});

//Show all jobs published by employeer => /api/v1/user/jobs/published
exports.getPublishedJobs = catchAsyncErrors(async(req, res, next) => {
    const jobs = await Job.find({ user: req.user.id });

    res.status(200).json({
        success: true,
        results: jobs.length,
        data: jobs
    });
});

// **** Adding controller methods only accessible by admin ****
//Show all users => /api/v1/admin/users
exports.getUsers = catchAsyncErrors(async(req, res, next) => {
    const apiFilters = new APIFilters(User.find(), req.query).filter().sort().limitFields().pagination();
    const users = await apiFilters.query;

    res.status(200).json({
        success: true,
        results: users.length,
        data: users
    });
});

//Delete user (admin) => /api/v1/admin/user/:id
exports.deleteUserAdmin = catchAsyncErrors(async(req, res, next) => {
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new errorHandler(`User not found with id: ${req.params.id}`, 404));
    }

    deleteUserData(user.id, user.role);
    user.remove();

    res.status(200).json({
        success: true,
        message: 'User deleted by admin.'
    });    
});

//Delete user files and employeer jobs
async function deleteUserData(user, role){
    if (role === 'employeer'){
        await Job.deleteMany({ user: user });
    }

    if (role === 'user'){
        const appliedJobs = await Job.find({ 'applicantsApplied.id': user }).select('+applicantsApplied');

        for (let i=0; i< appliedJobs.length; i++){
            let obj = appliedJobs[i].applicantsApplied.find(o => o.id === user);
            let filePath = `${__dirname}/uploads/${obj.resume}`.replace('\\controllers', '');
            fs.unlink(filePath, err => {
                if (err){
                    return console.log(err);
                }
            });

            appliedJobs[i].applicantsApplied.splice(appliedJobs[i].applicantsApplied.indexOf(obj.id));

            appliedJobs[i].save();
        }
    }
}