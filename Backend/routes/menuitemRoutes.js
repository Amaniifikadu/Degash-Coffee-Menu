const express = require('express');
const {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/menuItemController');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', getMenuItems); // public: customer menu
router.get('/:id', getMenuItemById);
router.post('/', protect, requireRole('admin', 'staff'), createMenuItem);
router.put('/:id', protect, requireRole('admin', 'staff'), updateMenuItem);
router.delete('/:id', protect, requireRole('admin'), deleteMenuItem);

module.exports = router;