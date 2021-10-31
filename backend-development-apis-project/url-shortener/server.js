/*#region -- packages */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const validUrl = require('valid-url');
const mongoUri = process.env['MONGO_URI'];
const mongoose = require('mongoose');
const app = express();
/*#endregion*/

/*#region -- middlewae */
app.use(cors());
app.use(
	express.urlencoded({ extended: true })
);
app.use(express.json());
app.use(
  '/public', 
  express.static(`${process.cwd()}/public`)
);
mongoose.connect(mongoUri, {
	useNewUrlParser: true,
	useUnifiedTopology: true
}).then(
	() => checkMongoConnection()
).catch(
	err => console.log(err)
);
/*#endregion*/

/*#region -- mongoose */
const urlSchema = new mongoose.Schema({
	shortened_url: {
		type: String,
		required: true
	},
	original_url: {
		type: String,
		required: true
	},
	created: {
		type: String,
		default: new Date().toLocaleString()
	}
});
const Url = mongoose.model(
	'Url', urlSchema
);
const mongo = {
	createAndSaveUrl: (shortUrl, originalUrl, next) => {
		console.log({
			shortened_url: shortUrl,
			original_url: originalUrl
		})
		const NewUrl = new Url({
			shortened_url: shortUrl,
			original_url: originalUrl
		});
		NewUrl.save(function(err, data) {
			if (err) console.error(err);
			next(data)
		});
	},
	findEntryByUri: async function(shortUrl, next) {
		Url.find({ shortened_url: shortUrl })
			.then(
				data=> next(data)
			)
			.catch(
				err=> console.log(err)
			);
		// return doesEntryExist
	},
	removeEntryByUri: () => {
		// since were passing a creation date, we can destroy any entry past a certain point
		// this is good if we want to limit usage of special URLs
		//
		// Url.findByIdAndRemove(
		// 	urlId,
		// 	function (err, data) {
		// 		if (err) console.log(err)
		// 	}
		// )
	}
};
/*#endregion*/

/*#region -- routing */
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});
app.get('/api/shorturl/:url?', function(req, res){
	Url.findOne({ shortened_url: req.params.url })
		.then(
			data => res.redirect(data.original_url)
		)
		.catch(
			err => console.log(err)
		);
});
/*#endregion*/

/*#region -- api */
app.post('/api/shorturl', async function(req, res) {
	const { body } = req;
	let shortenedUrl;
	try {
		if (!body.url) throw 'no-body';
		if (!!validUrl.isWebUri(body.url)) {
			let randomUrl = randomString(),
				urlExists = true;
			while (urlExists) {
				await Url.findOne({ shortened_url: randomUrl })
					.then(
						data => data === null ?
							urlExists = false : 
							randomUrl = randomString()
					).catch(
						err => console.log(err)
					);
			}
			shortenedUrl = randomUrl;
			mongo.createAndSaveUrl(randomUrl, body.url, req.next);
		} else throw 'invalid-url';
	} catch (err) {
		// let errorMessage;
		// switch (err) {
		// 	case 'invalid-url': 
		// 		errorMessage = 'invalid url';
		// 		break;
		// 	case 'no-body':
		// 		errorMessage = 'no body received';
		// 		break;
		// 	default:
		// 		errorMessage = 'undefined error';
		// };
		// res.json({
		// 	error: errorMessage
		// });
		// console.log(err)
		res.json({
			error: 'invalid url'
		});
		shortenedUrl = false;
	} finally {
		if (!!shortenedUrl) {
			res.json({
				short_url: shortenedUrl,
				original_url: body.url
			});
		}
	}
});
/*#endregion*/

/*#region -- server */
const port = 3000;
app.listen(port, function() {
	console.log(`Listening on port ${port}`);
});
/*#endregion*/

/*#region -- utils */
function randomString() {
	const random = Math.random().toString(36)
	return random.substr(6, random.length);
}
function checkMongoConnection() {
	if (mongoose.connection.readyState) {
		console.log("\nConnected to MongoDB\n");
	} else {
		console.log("\nErr! No connection to MongoDB.\n")
	};
}
/*#endregion*/

