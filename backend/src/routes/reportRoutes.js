const express = require('express');
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');
const authorizeRoles = require('../middleware/authorizeRoles');

const router = express.Router();

router.use(auth);

router.get('/organizer', authorizeRoles('organizer', 'admin'), reportController.getOrganizerReport);
router.get('/admin', authorizeRoles('admin'), reportController.getAdminReport);

module.exports = router;
