var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

const env = require("dotenv").config();
const mongoose = require("mongoose");
const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/hotseat-node";

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const authRouter = require("./routes/auth");

var app = express();

// Connect Mongo DB
mongoose
	.connect(dbUrl, {
		useUnifiedTopology: true,
	})
	.then((res) => {
		console.log("Database connected");
	})
	.catch((error) => {
		console.log(error);
	});
mongoose.Promise = global.Promise;
// Middlewears
app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept, Authorization"
	);

	if (req.method === "OPTIONS") {
		res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
		return res.status(200).json({});
	}
	next();
});

// view engine setup
// Setup EJS as the template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/api/auth", authRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render("error");
});

module.exports = app;
