require("dotenv").config();
const express = require("express"),
  cors = require("cors"),
  mongoose = require("mongoose");
const auth = require("./routes/auth"),
  admin = require("./routes/admin");
  const customer=require('./routes/customer')
const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.get("/api/health", (req, res) =>
  res.json({ ok: true, service: "BookRental API" }),
);
app.use("/api/auth", auth);
app.use("/api/admin", admin);
app.use("/api/customer", customer);
const User = require("./models/User");
const PORT = process.env.PORT || 5000;
mongoose
  .connect(
    `mongodb+srv://brahma:reddy123@luffycluster.czvoxe0.mongodb.net/bookrental?retryWrites=true&w=majority&appName=LuffyCluster`,
  )
  .then(() => app.listen(PORT, () => console.log(`API running on ${PORT}`)))
  .catch((e) => {
    console.error("MongoDB connection failed:", e.message);
    process.exit(1);
  });




