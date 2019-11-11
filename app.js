if(process.env.NODE_ENV !== 'production'){
	require('dotenv').config();
}

const express = require('express');
const request = require('request');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname + '/static'));
app.use(express.urlencoded({ extended: true }));

app.get("/locations", (req, res) => {
    console.log("Received GET on /locations");
    
    let query = encodeURI(`${req.query.address} ${req.query.city} ${req.query.state}`);
    request.get(`https://www.googleapis.com/civicinfo/v2/voterinfo?key=${process.env.CIVIC_KEY}&address=${query}`, (error, response, body) => {
		if(error){
			console.error(error);
			res.send(error);
		}else{
			res.json(body);
		}
	});
});

app.get("/representatives", (req, res) => {
	console.log("Recieved GET on /representatives");
	
	request.get(`http://whoismyrepresentative.com/getall_mems.php?zip=${req.query.zipcode}&output=json`, (error, response, body) => {
		if(error){
			console.error(error);
			res.send(error);
		}else if(body.indexOf("No Data") > -1){
			res.json('{"error": "No data found"}');
		}else{
			res.json(body);
		}
	});
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});