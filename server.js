const express = require("express");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();
const fileUpload = require("express-fileupload");
const cors  = require("cors")


const allowedOrigins = [
  "http://localhost:5173",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use(
  fileUpload({
    useTempFiles: true,              
    tempFileDir: "/tmp/",            
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authRoutes = require("./route/auth");
const tagRouts = require("./route/tag.route")
const courseRoute = require("./route/course.route");
const sectionRoute = require("./route/section.route");
const SubSection = require("./route/subSection.route")
const RatingAndReview = require("./route/ratingAndReview.route")
const payment = require("./route/payment.route")
const cart = require("./route/cart.route")

app.use("/api/v1", authRoutes);
app.use("/api/v1/tag",tagRouts);
app.use("/api/v1/course",courseRoute);
app.use("/api/v1/section",sectionRoute)
app.use("/api/v1/subSection",SubSection)
app.use("/api/v1/RAR",RatingAndReview);
app.use("/api/v1/payment",payment)
app.use("/api/v1/cart",cart)

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});

