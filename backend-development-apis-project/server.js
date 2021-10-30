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
	if (req.params.date.length > 0) {
		const DATE = (
			// standardize the given input to a UNIX date int
			req.params.date.indexOf('-') > -1 ?
				Date.parse(req.params.date) :
				parseInt(req.params.date)
		);
		const isGivenDateIsValid = function () {
			// check if the DATE var is a valid date format
			const givenDateIsValid = new Date(DATE) instanceof Date;
			// check if the DATE parsed is a valid number
			const dateIsNumber = !isNaN(Date.parse(new Date(DATE)).valueOf());
			if (givenDateIsValid && dateIsNumber) {
				return true;
			}
			return false;
		}();
		if (isGivenDateIsValid) {
			// if the date can be parsed
			res.json({
				"unix": DATE,
				"utc": new Date(DATE).toUTCString()
			});
		} else {
			// if the provided date does not pass the above check
			// return an error res
			res.json({ error: "Invalid Date" });
		};
	} else {
		res.json({ 
			'unix': Date.parse(new Date()),
			'utc': new Date().toUTCString()
		});
	}
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
