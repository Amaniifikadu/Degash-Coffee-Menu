const Order = require('../models/order');
const MenuItem = require('../models/menuitem');
const { getIO } = require('../socket');

// @desc    Place a new order (customer, no login required)
// @route   POST /api/orders
// @access  Public
// Body: { tableNumber: Number, items: [{ menuItemId, quantity }] }
const createOrder = async (req, res, next) => {
  try {
    const { tableNumber, items } = req.body;

    if (!tableNumber || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'tableNumber and a non-empty items array are required' });
    }

    // Re-fetch prices from DB rather than trusting client-sent prices
    const menuItemIds = items.map((i) => i.menuItemId);
    const menuItems = await MenuItem.find({ _id: { $in: menuItemIds } });

    const orderedItems = items.map(({ menuItemId, quantity }) => {
      const menuItem = menuItems.find((m) => m._id.toString() === menuItemId);
      if (!menuItem) throw new Error(`Menu item ${menuItemId} not found`);
      if (!menuItem.isAvailable) throw new Error(`${menuItem.name} is currently unavailable`);
      return {
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity,
      };
    });

    const totalPrice = orderedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await Order.create({
      tableNumber,
      orderedItems,
      totalPrice,
      orderStatus: 'Pending',
    });

    // Notify the admin dashboard in real time
    getIO().to('admin-room').emit('new-order', order);

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (admin), optionally filtered by status
// @route   GET /api/orders?status=Pending
// @access  Private/Admin
const getOrders = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.orderStatus = req.query.status;
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single order (used by customer order-tracking page)
// @route   GET /api/orders/:id
// @access  Public
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;
    const allowed = ['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'];
    if (!allowed.includes(orderStatus)) {
      return res.status(400).json({ message: `orderStatus must be one of: ${allowed.join(', ')}` });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      { new: true, runValidators: true }
    );

    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Tell the admin dashboard and the specific customer tracking this order
    getIO().to('admin-room').emit('order-updated', order);
    getIO().to(`order-${order._id}`).emit('order-updated', order);

    res.json(order);
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getOrders, getOrderById, updateOrderStatus };