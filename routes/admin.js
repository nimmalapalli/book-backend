const router = require("express").Router();
const auth = require("../middleware/auth");
const Book = require("../models/Book"),
  User = require("../models/User"),
  Order = require("../models/Order"),
  Author = require("../models/Author"),
  Category = require("../models/Category");
const map = {
  books: Book,
  users: User,
  orders: Order,
  authors: Author,
  categories: Category,
};
router.use(auth, auth.admin);
router.get("/dashboard", async (req, res) => {
  try {
    const now = new Date();
    const since = new Date(now);
    since.setDate(now.getDate() - 30);
    const [
      books,
      activeBooks,
      inactiveBooks,
      lowStock,
      users,
      activeUsers,
      newUsers,
      orders,
      pendingOrders,
      revenue,
      recentOrders,
      sales,
    ] = await Promise.all([
      Book.countDocuments(),
      Book.countDocuments({ status: "active" }),
      Book.countDocuments({ status: "inactive" }),
      Book.countDocuments({ stock: { $lte: 3 } }),
      User.countDocuments({ role: "customer" }),
      User.countDocuments({ role: "customer", status: "active" }),
      User.countDocuments({ role: "customer", createdAt: { $gte: since } }),
      Order.countDocuments(),
      Order.countDocuments({ status: "pending" }),
      Order.aggregate([
        { $match: { status: { $nin: ["cancelled", "pending"] } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.find().sort({ createdAt: -1 }).limit(8).lean(),
      Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().setDate(now.getDate() - 180)),
            },
            status: { $ne: "cancelled" },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            revenue: { $sum: "$total" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);
    res.json({
      books,
      activeBooks,
      inactiveBooks,
      lowStock,
      users,
      activeUsers,
      newUsers,
      orders,
      pendingOrders,
      revenue: revenue[0]?.total || 0,
      recentOrders,
      sales: sales.map((x) => ({ label: x._id, revenue: x.revenue || 0 })),
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});
router.get("/analytics", async (req, res) => {
  try {
    const [monthly, ordersByStatus] = await Promise.all([
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            revenue: { $sum: "$total" },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 12 },
      ]),
      Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $project: { _id: 0, status: "$_id", count: 1 } },
        { $sort: { count: -1 } },
      ]),
    ]);
    res.json({
      monthly: monthly.map((x) => ({ label: x._id, revenue: x.revenue || 0 })),
      ordersByStatus,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});
router.get("/stats", async (req, res) => {
  try {
    const [books, users, orders, authors, revenue] = await Promise.all([
      Book.countDocuments(),
      User.countDocuments({ role: "customer" }),
      Order.countDocuments(),
      Author.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
    ]);
    res.json({
      books,
      users,
      orders,
      authors,
      revenue: revenue[0]?.total || 0,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});
router.get("/:resource", async (req, res) => {
  try {
    const M = map[req.params.resource];
    if (!M) return res.status(404).json({ message: "Unknown resource" });
    res.json(await M.find().sort({ createdAt: -1 }).limit(1000).lean());
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});
router.post("/:resource", async (req, res) => {
  try {
    const M = map[req.params.resource];
    if (!M) return res.status(404).json({ message: "Unknown resource" });
    if (req.params.resource === "users" && req.body.password) {
      const bcrypt = require("bcryptjs");
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }
    const item = await M.create(req.body);
    res.status(201).json(item);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});
router.put("/:resource/:id", async (req, res) => {
  try {
    const M = map[req.params.resource];
    if (!M) return res.status(404).json({ message: "Unknown resource" });
    if (req.params.resource === "users" && req.body.password) {
      const bcrypt = require("bcryptjs");
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }
    const item = await M.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ message: "Record not found" });
    res.json(item);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});
router.delete("/:resource/:id", async (req, res) => {
  try {
    const M = map[req.params.resource];
    if (!M) return res.status(404).json({ message: "Unknown resource" });
    await M.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});
module.exports = router;
