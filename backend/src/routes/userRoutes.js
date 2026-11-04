const express = require('express');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const authorizeRoles = require('../middleware/authorizeRoles');

const router = express.Router();

// All user management routes require admin privileges
router.use(auth);
router.use(authorizeRoles('admin'));

router.route('/')
  .get(userController.getAllUsers);

router.route('/:id')
  .get(userController.getUserById)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
