/*#region -- requires + mongoose connect */
require('dotenv').config();
const mongoUri = process.env['MONGO_URI'];
const { Model } = require('mongoose');
const mongoose = require('mongoose');
const checkMongoConnection = ()=> {
  if (mongoose.connection.readyState) {
    console.log("\nConnected to MongoDB\n");
  } else {
    console.log("\nErr! No connection to MongoDB.\n")
  };
};
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(
    ()=> checkMongoConnection()
  ).catch(
    err=> console.log(err)
  );
/* #endregion */

/*#region -- mongoose schemas + models*/
const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: false
  },
  favoriteFoods: [{
    type: String,
    required: true
  }],
  created: {
    type: String,
    default: new Date().toLocaleString()
  }
});
const Person = mongoose.model(
  'Person',
  personSchema
);
/*#endregion*/

/*#region -- db functions */
const arrayOfPeople = [
  {
    name: 'Miss Honey',
    age: 11,
    favoriteFoods: [
      'beef',
      'more beef'
    ]
  },
  {
    name: 'Mike P',
    age: 34,
    favoriteFoods: [
      'pizza',
      'fox news'
    ]
  },
  {
    name: 'Damien Prince',
    age: 2,
    favoriteFoods: [
      'spaghetti',
      'something'
    ]
  }
]
const createAndSavePerson = async (done) => {
  const MissHoney = new Person(arrayOfPeople[0]);
  MissHoney.save(function(err, data) {
    if (err) {
      console.error(err);
      return done(err)
    }
    done(null, data);
  });
};
const createManyPeople = (done) => {
  Person.create(arrayOfPeople, function(err, data){
    if (err) {
      console.log(err);
      return done(err)
    }
    done(null, data);
  })
  
};
const findPeopleByName = (personName='Miss Honey', done) => {
  Person.find({ name:personName }, function(err, foundPerson) {
    if (err) {
      console.log(err)
      return done(err)
    }
    done(null, foundPerson)
  });
};
const findOneByFood = (food, done) => {
  Person.findOne({ favoriteFoods: food }, function (err, foundPerson) {
    if (err) {
      console.log(err)
      return done(err)
    }
    done(null, foundPerson)
  });
};
const findPersonById = (personId, done) => {
  Person.findById(
    { _id: personId }, 
    function (err, foundPerson) {
      if (err) {
        console.log(err)
        return done(err)
      }
      done(null, foundPerson)
    }
  );
};
const findEditThenSave = (personId, done) => {
  const foodToAdd = "hamburger";
  Person.findById(
    { _id: personId }, 
    function (err, foundPerson) {
      if (err) {
        console.log(err)
        return done(err)
      } else {
        foundPerson.favoriteFoods.push(foodToAdd);
        foundPerson.save(function (err, data) {
          if (err) {
            console.log(err)
            return done(err)
          }
          done(null, data)
        })
      }
    }
  );
};
const findAndUpdate = async (personName, done) => {
  const ageToSet = 20;
  const filterQuery = { name: personName };
  const updatePerson = { age: ageToSet };
  Person.findOneAndUpdate(
    filterQuery,
    updatePerson,
    null, 
    function(err, data){
      if (err) {
        console.log(err)
        return done(err)
      }
      done(null, data)
    })
};
const removeById = (personId, done) => {
  Person.findByIdAndRemove(
    personId,
    function(err, data) {
      if (err) {
        console.log(err)
        return done(err)
      }
      done(null, data)
    }
  )
};
const removeManyPeople = (done) => {
  const nameToRemove = "Mary";
  Person.deleteMany(
    { name: nameToRemove }, 
    function (err, data) {
      if (err) {
        console.log(err)
        return done(err)
      }
      done(null, data)
    });
};
const queryChain = (done) => {
  const foodToSearch = "burrito";
  Person
    .find({ 
      favoriteFoods: { $in: [ foodToSearch ] } 
    })
    .sort({ name: 1 })
    .limit(2)
    .select({ age: 0 })
    .exec( function(err, data) {
      if (err) {
        console.log(err);
        return done(err);
      }
      done(null, data);
    })
};
/*#endregion*/

/*#region -- fcc nonsense*/

/** **Well Done !!**
/* You completed these challenges, let's go celebrate !
 */

//----- **DO NOT EDIT BELOW THIS LINE** ----------------------------------

exports.PersonModel = Person;
exports.createAndSavePerson = createAndSavePerson;
exports.findPeopleByName = findPeopleByName;
exports.findOneByFood = findOneByFood;
exports.findPersonById = findPersonById;
exports.findEditThenSave = findEditThenSave;
exports.findAndUpdate = findAndUpdate;
exports.createManyPeople = createManyPeople;
exports.removeById = removeById;
exports.removeManyPeople = removeManyPeople;
exports.queryChain = queryChain;

/*#endregion*/
