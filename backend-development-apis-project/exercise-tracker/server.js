/*#region -- packages */
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoUri = process.env['MONGO_URI'];
const mongoose = require('mongoose');
const app = express()
/*#endregion*/

/*#region -- middleware */
app.use(cors())
app.use(
  express.urlencoded({ extended: true })
);
app.use(express.json());
app.use(express.static('public'))
/*#endregion*/

/*#region -- mongoose */
mongoose.connect(mongoUri, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	}).then(
		() => checkMongoConnection()
	).catch(
		err => console.log(err)
	);
const userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true
	},
	count: {
		type: Number,
		default: 0
	},
	log: {
		type: [Object],
		required: true
	},
	created: {
		type: String,
		default: new Date().toLocaleString()
	}
});
const User = mongoose.model(
	'User', userSchema
);
const exerciseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: new Date().toLocaleString()
  }
});
const Exercise = mongoose.model(
  'Exercise', exerciseSchema
);
// const logSchema = new mongoose.Schema({
// 	username: {
// 		type: String,
// 		required: true
// 	},
// 	count: {
// 		type: Number
// 	},
// 	log: {
// 		type: [ Object ],
// 		required: true
// 	}
// });
// const Log = mongoose.model(
// 	'Log', logSchema
// );
/*#endregion*/

/*#region -- routing */
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
/*#endregion*/

/*#region -- api */
app.get('/api/users', function (req, res) {
	/**
	 * return array of all users
	 */
	User.find()
		.then(data=>{
			res.json(data)
			return;
		})
		.catch(err=>{
			console.log(err)
			res.sendStatus(204)
			return;
		});
})
app.get('/api/users/:_id/logs?[from][&to][&limit]', function (req, res) {
	/**
	 * [] = optional
	 * from, to = dates (yyyy-mm-dd);
	 * limit = number
	 */
	console.log(req.params)
})
app.post('/api/users', function(req,res) {
	/**
	 * username
	 */
	try {
		const { body } = req;
		if (body.username) {
			const userObject = {
				username: body.username
			};
			const createUser = async ()=> {
				const NewUser = new User(userObject);
				return NewUser.save();
			}
			User.findOne(userObject)
				.then( async data=> {
					if (data === null) {
						const entryForNewUser = await createUser();
						res.json({
							username: entryForNewUser.username,
							_id: entryForNewUser._id
						})
					} else {
						res.sendStatus( 204 )
						return;
					}
				});
		}
	} catch (err) {
		console.log(err)
		res.json({
			error: 'unknown error'
		})
		return;
	}
})
app.post('/api/users/:_id/exercises', async function (req, res) {
  /**
   * _id
   * description *
   * duration * = minute length
   * date = yyyy mm dd
   */
	try {
		const { body, params } = req;
		const NewExercise = {
			description: body.description || '',
			duration: body.duration || 0,
			date: body.date || new Date()
		};
		console.log('\n')
		const updatedUser = await User.findByIdAndUpdate(
			params._id, 
			{ log:[NewExercise], count:+1 },
			// function(err, data) {
			// 	if (err) {
			// 		console.log(err);
			// 		res.sendStatus(204)
			// 		return;
			// 	} else {
			// 		res.json(data)
			// 		return;
			// 	}
			// }
		)
			// .then(async data => {
			// 	if (data !== null) {
			// 		console.log(data)
			// 		res.json(data)
			// 	} else {
			// 		res.sendStatus(204)
			// 	}
			// });
		console.log(updatedUser)
		res.json({ ...updatedUser })
		return;
	} catch (err) {
		console.log(err)
		res.json({
			error: 'unknown error'
		})
		return;
	}
})
/*#endregion*/

/*#region -- server */
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
/*#endregion*/

/*#region -- utils */
// function randomString() {
//   const random = Math.random().toString(36)
//   return random.substr(6, random.length);
// }
function checkMongoConnection() {
  if (mongoose.connection.readyState) {
    console.log("\nConnected to MongoDB\n");
  } else {
    console.log("\nErr! No connection to MongoDB.\n")
  };
}
/*#endregion*/
