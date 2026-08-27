const jwt = require("jsonwebtoken");

const secret =
   "book-rent-app";

/**
 * Authenticate any logged-in user
 * Allows:
 * - admin
 * - customer
 */
function auth(req, res, next) {
  try {
    const header = req.headers.authorization || "";

 
    const token = header.slice(7).trim();

  

    const decoded = jwt.verify(token, "book-rent-app");

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}

/**
 * Admin only
 */
function admin(req, res, next) {
 

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required",
    });
  }

  next();
}

/**
 * Customer only
 */
function customer(req, res, next) {


  if (req.user.role !== "customer") {
    return res.status(403).json({
      message: "Customer access required",
    });
  }

  next();
}

/**
 * Admin OR Customer
 */
function adminOrCustomer(req, res, next) {


  if (
    req.user.role !== "admin" &&
    req.user.role !== "customer"
  ) {
    return res.status(403).json({
      message: "Access denied",
    });
  }

  next();
}

module.exports = auth;
module.exports.admin = admin;
module.exports.customer = customer;
module.exports.adminOrCustomer = adminOrCustomer;