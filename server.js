const http = require("http");
const https = require("https");
const fs = require("fs");
const app = require("./app");
const port = process.env.PORT || 4000;

const options = {
	key: fs.existsSync(process.env.SSL_KEY)
		? fs.readFileSync(process.env.SSL_KEY)
		: null,
	cert: fs.existsSync(process.env.SSL_CRT)
		? fs.readFileSync(process.env.SSL_CRT)
		: null,
};

const server =
	process.env.MODE == "DEV"
		? http.createServer(app)
		: https.createServer(options, app);

console.log("Serving on ", port);

server.listen(port);
