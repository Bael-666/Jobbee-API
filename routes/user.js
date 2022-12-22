const express = require('express');
const router = express.Router();

const { getUserProfile, updatePassword, updateUser, deleteUser, getAppliedJobs, getPublishedJobs, getUsers, deleteUserAdmin } = require('../controllers/userController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

router.use(isAuthenticatedUser);
router.route('/api/v1/user').get(getUserProfile);
router.route('/api/v1/user/jobs/applied').get(authorizeRoles('user'), getAppliedJobs);
router.route('/api/v1/user/jobs/published').get(authorizeRoles('employeer', 'admin'), getPublishedJobs);
router.route('/api/v1/user/password').put(updatePassword);
router.route('/api/v1/user/update').put(updateUser);
router.route('/api/v1/user/delete').delete(deleteUser);

//Admin routes
router.route('/api/v1/admin/users').get(authorizeRoles('admin'), getUsers);
router.route('/api/v1/admin/user/:id').delete(authorizeRoles('admin'), deleteUserAdmin);
module.exports = router;