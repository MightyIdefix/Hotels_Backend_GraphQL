const mongoose = require('mongoose');

let dbUrl = process.env.MONGODB_URI;
if (process.env.NODE_ENV === 'production') {
    dbUrl = process.env.MONGODB_URI;
}

mongoose.connection.on('connected', () => {
    console.log(`Mongoose connected to ${dbUrl}`);
});
mongoose.connection.on('error', err => {
    console.log('Mongoose connection error:', err);
});
mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});
const db = mongoose.connection;
// Connect to database
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

// Listen for signals to shutdown, so we can close the connection to the database
const gracefulShutdown = (msg, callback) => {
    mongoose.connection.close(() => {
        console.log(`Mongoose disconnected through ${msg}`);
        callback();
    });
};

// For nodemon restarts                                 
process.once('SIGUSR2', () => {
    gracefulShutdown('nodemon restart', () => {
        process.kill(process.pid, 'SIGUSR2');
    });
});
// For app termination
process.on('SIGINT', () => {
    gracefulShutdown('app termination', () => {
        process.exit(0);
    });
});
// For Heroku app termination
process.on('SIGTERM', () => {
    gracefulShutdown('Heroku app shutdown', () => {
        process.exit(0);
    });
});
require('./user');
require('./hotel');

var userCollection = db.collection('users');
var hotelCollection = db.collection('hotels');

function CreateUser(username, password, role)
{
    var User = mongoose.model('User');
    var newUser = new User();
    newUser.password = password;
    newUser.username = username;
    newUser.role = role;
    newUser.save(function (err)
    {
        if (err) 
            console.log(err);
        else
            console.log("Created user succesfully");
    });
}

async function getUser(user)
{
    var result =  await userCollection.findOne({username:user});
    return result;
}
async function CreateHotel(navn, hotelmanager)
{
    var Hotel = mongoose.model('Hotel');
    guestObjectID = await getUser(hotelmanager);
    var hotel = new Hotel();
    hotel.name = navn;
    hotel.hotelManager=guestObjectID;
    hotel.save(function (err)
    {
        if (err) 
            console.log(err);
        else
            console.log("Created hotel succesfully");
    });
}

async function addRoom(hotelnavn, roomNumber_, occupied_, guestName_, price_, suitetype_)
{
    guestObjectID = await getUser(guestName_);
    var newroom = {number:roomNumber_, occupied:occupied_, guests:[guestObjectID._id], price: price_, suitetype: suitetype_};
    var query = {name: hotelnavn};

    await hotelCollection.findOneAndUpdate(query,
        {$push: {"rooms" : newroom}},
        function(err, doc) {
        if (err) console.log(err);
    });
};

async function findFreeRoomsForHotel(hotelnavn)
{
    var hotel =  await hotelCollection.findOne({name:hotelnavn});
    var freeRooms = hotel.rooms.find(room => {
        return room.occupied === false
      })
    return freeRooms;
};

//CreateUser("John", "123123", "hotelmanager");
//CreateHotel('SleepSick', "John");
//addRoom('SleepSick', 222, true, 'John', 530, "Junior");
//addRoom('SleepSick', 17, true, 'TestUser1', 750, "Deluxe");
//findFreeRoomsForHotel("TestHotel");

//CreateUser("AdminUser", "123", "administrator");
module.exports