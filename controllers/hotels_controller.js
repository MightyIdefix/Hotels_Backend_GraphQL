const mongoose = require('mongoose');
const hotelColl = mongoose.model('Hotel');
const atob = require('atob');
const UserColl = mongoose.model('User');

//post Hotel
module.exports.addhotel = async function (req, res) {
    const name = req.body.name;
    const roomnumber = req.body.number;
    const token = req.header('Authorization');

    if(!token)
    {
        res.status(401).json({
            "Information": "https://cutt.ly/1lXavhg",
            "Error": "unauthorized: You need to log in",
        });
    }

    decodedToken = JSON.parse(atob(token.split('.')[1]));

    user = await UserColl.findOne({username: decodedToken.username});
    if(decodedToken.role == 'hotelmanager')
    {
        const newHotel = await hotelColl.create({
            name: name,
            hotelManager: user._id,
        }).catch(err => 
            res.status(400).json({
                "Information": "https://cutt.ly/1lXavhg",
                "title": "Unable to create hotel record",
                "detail": err
            })
        );
    
        if(newHotel != null) {
            res.status(201).json({
                "Information": "https://cutt.ly/1lXavhg",
                "title": "Created hotel record",
                newHotel
            });
        }
    }
    else
    {
        res.status(401).json({
            "Information": "https://cutt.ly/1lXavhg",
            "Error": "unauthorized: You're not a hotel manager!",
        });
    }
};

//post Rooms
module.exports.addRoom = async function (req, res) {
    const name_ = req.body.name;
    const number_ = req.body.number;
    const token = req.header('Authorization');

    if(!token)
    {
        res.status(401).json({
            "Information": "https://cutt.ly/1lXavhg",
            "Error": "unauthorized: You need to log in",
        });
    }

    var query = {name: name_};
    var newroom = {number:number_, occupied:false, guests:[]};

    decodedToken = JSON.parse(atob(token.split('.')[1]));
    user = await UserColl.findOne({username: decodedToken.username});
    HotelToUpdate = await hotelColl.findOne(query);

    if(JSON.stringify(HotelToUpdate.hotelManager) == JSON.stringify(user._id) && decodedToken.role == 'hotelmanager')
    {
        const newRoomCall = await hotelColl.findOneAndUpdate(query,
            {$push: {"rooms" : newroom}},
            function(err, doc) {
            if (err) console.log(err);
        }).catch(err => 
            res.status(400).json({
                "Information": "https://cutt.ly/1lXavhg",
                "title": "Unable to create new room record",
                "detail": err
            })
        );
        if(newRoomCall != null) 
        {
            res.status(201).json({
                "Information": "https://cutt.ly/1lXavhg",
                "title": "Created room record",
                newRoomCall
            });
        };
    }
    else
    {
        res.status(401).json({
            "Information": "https://cutt.ly/1lXavhg",
            "Error": "unauthorized: You're not authorized to add a room to this hotel",
        });
    }
};

//post Rooms
module.exports.searchFreeRooms = async function (req, res) {
    const hotelname = req.body.name;
    const token = req.header('Authorization');

    if(!token)
    {
        res.status(401).json({
            "Information": "https://cutt.ly/1lXavhg",
            "Error": "unauthorized: You need to log in",
        });
    }

    decodedToken = JSON.parse(atob(token.split('.')[1]));
    var query = {name: hotelname};

    if(decodedToken.role == 'bruger')
    {
        const searchFreeRooms = await hotelColl.findOne(query,
            function(err) {
            if (err) console.log(err);
        }).catch(err => 
            res.status(400).json({
                "Information": "https://cutt.ly/1lXavhg",
                "title": "Unable to find any free rooms in hotel" + hotelname,
                "detail": err
            })
        );
        var freeRooms = [];
        searchFreeRooms.rooms.find(room => {
            if(room.occupied === false)
                freeRooms.push(room);
          });
    
        if(searchFreeRooms != null) {
            res.status(201).json({
                "Information": "https://cutt.ly/1lXavhg",
                "title": "free rooms in hotel " + hotelname + " :",
                freeRooms
            });
        }
    }
    else
    {
        res.status(401).json({
            "Information": "https://cutt.ly/1lXavhg",
            "Error": "unauthorized: You're not of role 'bruger'",
        });
    }
};

module.export
