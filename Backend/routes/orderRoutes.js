const express = require('express');
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/', createOrder); // public: customer places an order, no login
router.get('/:id', getOrderById); // public: customer tracks their order
router.get('/', protect, requireRole('admin', 'staff'), getOrders);
router.patch('/:id/status', protect, requireRole('admin', 'staff'), updateOrderStatus);

module.exports = router;