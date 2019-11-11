const express = require('express');
const app = express();
const request = require('request');
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname + '/static'));
app.use(express.urlencoded({ extended: true }));

app.get("/location", (req, res) => {
    console.log("Received GET on /location");
});

app.get("/representatives", (req, res) => {
	console.log("Recieved GET on /representatives");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});