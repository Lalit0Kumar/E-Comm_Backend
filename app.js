const express = require("express");
var bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const Razorpay = require("razorpay");
require("dotenv").config();
const app = express();

// Import the file
const connectDb = require("./config/connectDb.js");
const authRouter = require("./routes/userRoute.js");
const productRouter = require("./routes/productRoutes.js");
const blogRouter = require("./routes/blogRoutes.js");
const categoryRouter = require("./routes/prodCategoryRoutes.js");
const blogCateRouter = require("./routes/blogCateRoutes.js");
const brandRouter = require("./routes/brandRoutes.js");
const couponRouter = require("./routes/couponRoutes.js");
const orderRouter = require("./routes/orderRoutes.js");

const { notFound, errorHandler } = require("./middlewares/errorHandler.js");

app.use(cors());

// Define a port
const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;

//connect Database
connectDb(DATABASE_URL);

app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// cors
// app.use(cors());
app.use(cookieParser());
app.use(morgan("dev"));

// parse application/json
app.use(bodyParser.json());
// app.use(express.json());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(express.urlencoded())

// Load  a route
app.use("/api/user", authRouter);
app.use("/api/product", productRouter);
app.use("/api/blog", blogRouter);
app.use("/api/category", categoryRouter);
app.use("/api/blogcategory", blogCateRouter);
app.use("/api/brand", brandRouter);
app.use("/api/coupon", couponRouter);
app.use("/api/orders", orderRouter);

// error Handler
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () => {
  //console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
