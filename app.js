if(process.env.NODE_ENV !== 'production'){
	require('dotenv').config();
}

const express = require('express');
const router = require('./router');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname + '/static'));
app.use(express.urlencoded({ extended: true }));
app.use('/', router);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});