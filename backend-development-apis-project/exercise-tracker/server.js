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
	created: {
		type: String,
		default: new Date().toLocaleString()
	}
});
const User = mongoose.model(
	'User', userSchema
);
const exerciseSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	duration: {
		type: Number,
		required: true
	},
	date: {
		type: String,
		required: true
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
// 		type: Number,
// 		default: 0
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
	try {
		User.find()
			.select('username _id')
			.exec(function (err, data) {
				if (err) console.log(err)
				res.json(data)
			})
	} catch (err) {
		console.log(err)
		res.sendStatus(204)
	}
	return
})
app.get('/api/users/:_id/logs', async function (req, res) {
	/**
	 * [] = optional
	 * from, to = dates (yyyy-mm-dd);
	 * limit = number
	 */
	try {
		const { query, params } = req;
		if (!!params._id) {
			const userById = await User.findOne({ _id: params._id });
			const allExercises = await Exercise.find(
				{ username: userById.username }
			);
			const filterExerciseByDates = (exercise) => {
				const exerciseDateAsUnix = Date.parse(new Date(exercise.date));
				if (query.from) {
					const fromDateAsUnix = Date.parse(new Date(query.from).toDateString())
					if (exerciseDateAsUnix < fromDateAsUnix) {
						return false
					}
				}
				if (query.to) {
					const toDateAsUnix = Date.parse(new Date(query.to).toDateString())
					if (exerciseDateAsUnix > toDateAsUnix) {
						return false
					}
				}
				return exercise
			};
			if (Object.entries(query).length > 0) {
				console.log('\n')
				let exercisesAfterQueryFilter = 
					allExercises.map(
						(exercise) => filterExerciseByDates(exercise)
					).filter(Boolean);
				if (query.limit) {
					const limit = parseInt(query.limit);
					exercisesAfterQueryFilter = exercisesAfterQueryFilter.slice(0, limit)
				}
				res.json({
					...userById,
					count: exercisesAfterQueryFilter.length,
					log: exercisesAfterQueryFilter
				})
			} else {
				res.json({
					...userById,
					count: allExercises.length,
					log: allExercises
				})
			}
		} else throw 'no id provided';
	} catch (err) {
		console.log(err)
		res.sendStatus(204)
	}
	return
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
		const userById = await User.findOne({ _id: params._id });
		const getDateWtfWhyWhyWhy = (givenDate)=> {
			/*
			idk why i needed to do this
			this fixed local dev problems with timezones
			*
			FCC is sending over a GMT date, and asking for a specific formatting
			Converting it using toDateString() converts it over to UTC, and then formats the string
			by adding 24 hours when given a date, its correct.
			*/
			if (!!givenDate) {
				const parsedDate = Date.parse(new Date(givenDate));
				return new Date(parsedDate + 86400000).toDateString()
			}
			return new Date().toDateString()
		}
		const exerciseObj = {
			username: userById.username,
			description: body.description || '',
			duration: parseInt(body.duration) || 0,
			date: (
				!!body.date ? 
					new Date(body.date).toDateString() 
					: new Date().toDateString()
			)
		}
		const NewExercise = new Exercise({ ...exerciseObj });
		NewExercise.save()
			.then( ()=> {
				res.json({
					...exerciseObj,
					_id: userById._id.toString(),
				})
			})
			.catch(
				err => console.log(err)
			);
		return
	} catch (err) {
		console.log(err)
		res.json({
			error: 'unknown error'
		})
		return
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
