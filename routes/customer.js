const router = require("express").Router();
const auth = require("../middleware/auth");
const Book = require("../models/Book");
const Author = require("../models/Author");
const Category = require("../models/Category");
const Order = require("../models/Order");

router.use(auth);

router.get("/books", async (req, res) => {
  try {
    res.json(
      await Book.find({ status: "active" }).sort({ createdAt: -1 }).lean(),
    );
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});
router.get("/books/:id", async (req, res) => {
  try {
    const b = await Book.findOne({
      _id: req.params.id,
      status: "active",
    }).lean();
    if (!b) return res.status(404).json({ message: "Book not found" });
    res.json(b);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});
router.get("/authors", async (req, res) => {
  try {
    res.json(await Author.find().sort({ name: 1 }).lean());
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});


router.get("/books/:id", async (req, res) => {
  try {
    const { id } = req.params;

    /*
     * Validate MongoDB ObjectId first.
     */
    const mongoose = require("mongoose");

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid book ID",
      });
    }

    /*
     * Find active book by ID.
     */
    const book = await Book.findOne({
      _id: id,
      status: "active",
    }).lean();

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    /*
     * Normalize MongoDB response for React.
     */
    const result = {
      ...book,

      id: String(book._id),

      cover_image_url:
        book.cover_image_url ||
        book.coverImage ||
        null,

      rentalPrice:
        book.rentalPrice ??
        book.rental_price ??
        book.price ??
        0,
    };

    /*
     * Don't expose unnecessary MongoDB _id
     * to the frontend if you don't need it.
     */
    delete result._id;

    res.json(result);

  } catch (e) {
    console.error("GET /books/:id error:", e);

    res.status(500).json({
      message: e.message,
    });
  }
});
router.get("/categories", async (req, res) => {
  try {
    res.json(
      await Category.find({ status: "active" }).sort({ name: 1 }).lean(),
    );
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});
router.get("/orders/my", async (req, res) => {
  try {
    res.json(
      await Order.find({ customer: String(req.user.id) })
        .sort({ createdAt: -1 })
        .lean(),
    );
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});
router.get("/orders/:id", async (req, res) => {
  try {
    const o = await Order.findOne({
      _id: req.params.id,
      customer: String(req.user.id),
    }).lean();
    if (!o) return res.status(404).json({ message: "Order not found" });
    res.json(o);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});
router.post("/orders", async (req, res) => {
  try {
    const { items, total, type = "rental", startDate, endDate } = req.body;
    if (!Array.isArray(items) || !items.length)
      return res.status(400).json({ message: "items are required" });
    const ids = items.map((x) => x.bookId);
    const books = await Book.find({ _id: { $in: ids }, status: "active" });
    if (books.length !== ids.length)
      return res
        .status(400)
        .json({ message: "One or more books are unavailable" });
    const order = await Order.create({
      customer: String(req.user.id),
      items,
      total,
      type,
      status: "pending",
      startDate,
      endDate,
    });
    res.status(201).json(order);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});
module.exports = router;
