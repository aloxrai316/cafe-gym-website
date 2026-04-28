const Order = require('../../models/Order');
const Review = require('../../models/Review');
const WaiterCall = require('../../models/WaiterCall');

exports.getDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's orders
    const todayOrders = await Order.find({
      createdAt: { $gte: today, $lt: tomorrow }
    }).sort({ createdAt: -1 });

    // Daily sales (only completed orders)
    const dailySalesAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: today, $lt: tomorrow }, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, totalSales: { $sum: '$totalAmount' }, totalOrders: { $sum: 1 } } }
    ]);
    const dailySales = dailySalesAgg[0]?.totalSales || 0;
    const totalOrdersToday = dailySalesAgg[0]?.totalOrders || 0;

    // Unique customers today (by tableNumber as proxy for visitors)
    const uniqueTablesAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: today, $lt: tomorrow } } },
      { $group: { _id: '$tableNumber' } }
    ]);
    const dailyCustomerCount = uniqueTablesAgg.length;

    // Pending orders count
    const pendingOrders = await Order.countDocuments({ status: { $in: ['pending', 'preparing'] } });

    // Active waiter calls
    const activeCalls = await WaiterCall.countDocuments({ status: 'pending' });

    // Recent reviews
    const recentReviews = await Review.find().sort({ createdAt: -1 }).limit(5);

    // Orders per status breakdown
    const statusBreakdown = await Order.aggregate([
      { $match: { createdAt: { $gte: today, $lt: tomorrow } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        dailySales,
        totalOrdersToday,
        dailyCustomerCount,
        pendingOrders,
        activeCalls,
        recentReviews,
        todayOrders,
        statusBreakdown
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate) : new Date();

    const salesData = await Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, status: { $ne: 'cancelled' } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        totalSales: { $sum: '$totalAmount' },
        orderCount: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    const topItems = await Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.name', totalOrdered: { $sum: '$items.quantity' }, totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { totalOrdered: -1 } },
      { $limit: 10 }
    ]);

    res.json({ success: true, data: { salesData, topItems } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
