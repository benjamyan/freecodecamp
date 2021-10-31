/*#region packages*/
require('dotenv').config();
const express = require('express');
// const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
/*#endregion*/

/*#region middleware*/
app.use(
cors({optionsSuccessStatus: 200})
);
// app.use(
//   bodyParser.json()
// );
app.use(express.static('public'));
/*#endregion*/

/*#region routing*/
app.get("/", function (req, res) {
	res.sendFile(__dirname + '/views/index.html');
});
/*#endregion*/

/*#region endpoints*/
app.get("/api/hello", function (req, res) {
	res.json({ greeting: 'hello API' });
});
app.get("/api/:date?", function (req, res) {
	const { params } = req;
	try {
		const dateAsUnixInt = (
			/(^\d+$)/gi.test(params.date) ?
				parseInt(params.date)
				: Date.parse(params.date)
		);
		if (!isNaN(dateAsUnixInt)) {
			if (
				new Date(dateAsUnixInt) instanceof Date &&
				!isNaN(Date.parse(new Date(dateAsUnixInt)).valueOf())
			) {
				res.json({
					"unix": dateAsUnixInt,
					"utc": new Date(dateAsUnixInt).toUTCString()
				});
			} else throw 'Invalid Date';
		} else {
			if (typeof (params.date) !== 'string') {
				res.json({
					"unix": Date.parse(new Date()),
					"utc": new Date().toUTCString()
				})
			} else throw 'Invalid Date';
		}
	} catch (err) {
		res.json({ error: "Invalid Date" })
	};
});
/*#endregion*/

/*#region instanciation*/
const listener = app.listen(
	process.env.PORT, 
	function () {
		console.log('Your app is listening on port ' + listener.address().port);
	}
);
/*#endregion*/
