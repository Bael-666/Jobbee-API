const express = require('express');
const router = express.Router();

//Importing jobs controller methods
const {getJobs, newJob, getJob, getJobsInRadius, updateJob, deleteJob, jobStats, applyJob} = require('../controllers/jobsControllers');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');



router.route('/api/v1/jobs').get(getJobs);
router.route('/api/v1/job/:id/:slug').get(getJob);
router.route('/api/v1/jobs/:zipcode/:distance').get(getJobsInRadius);
router.route('/api/v1/stats/:topic').get(jobStats);
router.route('/api/v1/job/new').post(isAuthenticatedUser, authorizeRoles('employeer', 'admin'), newJob);
router.route('/api/v1/job/:id').put(isAuthenticatedUser, authorizeRoles('employeer', 'admin'), updateJob).delete(isAuthenticatedUser, authorizeRoles('employeer', 'admin'), deleteJob);
router.route('/api/v1/job/:id/apply').put(isAuthenticatedUser, authorizeRoles('user'), applyJob);
module.exports = router;