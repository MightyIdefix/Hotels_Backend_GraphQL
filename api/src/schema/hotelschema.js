const mongoose = require('mongoose');
const graphql = require('graphql');
require('../../../models/db');
require('../../../models/user');
require('../../../models/hotel');
const hotelColl = mongoose.model('Hotel');
const UserColl = mongoose.model('User');
const atob = require('atob');
const { argsToArgsConfig } = require('graphql/type/definition');
const { update } = require('../../../models/user');

const { 
    GraphQLObjectType, GraphQLString, 
    GraphQLID, GraphQLInt,GraphQLSchema, 
    GraphQLList,GraphQLNonNull, GraphQLBoolean
} = graphql;
//docs: https://medium.com/@utkarshprakash/setting-up-graphql-server-with-nodejs-express-and-mongodb-d72fba13216
//Schema defines data on the Graph like object types(book type), relation between 
//these object types and describes how it can reach into the graph to interact with 
//the data to retrieve or mutate the data   


const RoomGuest = new GraphQLObjectType({
    name: 'roomguest',
    //We are wrapping fields in the function as we dont want to execute this until 
    //everything is inilized. For example below code will throw error AuthorType not 
    //found if not wrapped in a function
    fields: () => ({
        id: { type: GraphQLID},
        username: {type: GraphQLString}
    })
});


const Room = new GraphQLObjectType({
    name: 'room',
    fields: () => ({
        guests: {
            type: RoomGuest,
            resolve(parent, args) {
                return UserColl.findById(parent.guests);
            }
        },
        number: { type: GraphQLInt },
        occupied: {type: GraphQLBoolean},
        price: {type: GraphQLInt},
        suitetype: {type: GraphQLString}
    })
});

const HotelManager = new GraphQLObjectType({
    name: 'hotelmanager',
    fields: () => ({
        id: { type: GraphQLID},
        username: { type: GraphQLString },
        role: {type: GraphQLString}
    })
});


const HotelType = new GraphQLObjectType({
    name: 'hotel',
    fields: () => ({
        id: { type: GraphQLID},
        name: { type: GraphQLString },
        hotelManager: {
            type: HotelManager,
            resolve(parent, args) {
                return UserColl.findById(parent.hotelManager);
            }
        },
        rooms: {type: GraphQLList(Room)}
    })
});

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLID },
        username: { type: GraphQLString },
        password: { type: GraphQLInt },
        role: {type: GraphQLString}
    })
})

//RootQuery describe how users can use the graph and grab data.
//E.g Root query to get all authors, get all books, get a particular 
//book or get a particular author.
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        hotel: {
            type: HotelType,
            //argument passed by the user while making the query
            args: { 
                name: { type: GraphQLString }
            },
            resolve(parent, args) {
                //Here we define how to get data from database source

                //this will return the book with id passed in argument 
                //by the user
                return hotelColl.findOne({name: args.name});
            }
        },
        user:{
            type: UserType,
            args: {
                username: {type: GraphQLString }
            },
            resolve(parent, args) {
                return UserColl.find({username: args.username});
            }
        },
        login:{ //user login
            type: GraphQLString,
            args:{
                username: { type: new GraphQLNonNull(GraphQLString) },
                password: { type: new GraphQLNonNull(GraphQLString) },
            },
            async resolve(parent, args){
                user = await UserColl.findOne({username: args.username, password: args.password});
                if(user)
                    return user.generateJwt();
                else
                    return "Login failed - Wrong username or password";
            }
        },
    }
});

//Very similar to RootQuery helps user to add/update to the database.
const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addhotel: {
            type: HotelType,
            args: {
                //GraphQLNonNull make these field required
                name: { type: new GraphQLNonNull(GraphQLString) },
                token: { type: new GraphQLNonNull(GraphQLString) }
            },
            async resolve(parent, args) {
                decodedToken = await JSON.parse(atob(args.token.split('.')[1]));
                if(decodedToken.role == "hotelmanager")
                {
                    user = await UserColl.findOne({username: decodedToken.username});
                    let hotel = new hotelColl({
                        name: args.name,
                        hotelManager: user._id
                    });
                    return hotel.save();
                }
            }
        },
        addroom:{
            type: HotelType,
            args:{
                hotelname: {type: new GraphQLNonNull(GraphQLString)},
                number: { type: new GraphQLNonNull(GraphQLInt)},
                occupied: {type: new GraphQLNonNull(GraphQLBoolean)},
                price: {type: new GraphQLNonNull(GraphQLInt)},
                suitetype: {type: new GraphQLNonNull(GraphQLString)},
                token: { type: new GraphQLNonNull(GraphQLString) }
            },
            async resolve(parent, args){
                decodedToken = await JSON.parse(atob(args.token.split('.')[1]));
                //find hotel to add room to.
                HotelToUpdate = await hotelColl.findOne({name: args.hotelname});
                if(decodedToken.id == HotelToUpdate.hotelManager)
                {
                    var newroom = {number: args.number, occupied:args.occupied, guests:[], suitetype: args.suitetype, price: args.price};
                    return hotelColl.findOneAndUpdate( {name: args.hotelname}, {$push: {"rooms" : newroom}})
                }
            }
        },  
        adduser: { //Register User
            type: UserType,
            args: {
                //GraphQLNonNull make these field required
                username: { type: new GraphQLNonNull(GraphQLString) },
                password: { type: new GraphQLNonNull(GraphQLString) },
                role: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve(parent, args) {
                let newUser = new UserColl({
                    username: args.username,
                    password: args.password,
                    role: args.role
                });
                return newUser.save();
            }
        },
        changeprice: {//changeprice
            type: HotelType,
            args: {
                //GraphQLNonNull make these field required
                hotelname: { type: new GraphQLNonNull(GraphQLString) },
                roomnumber: {type: new GraphQLNonNull(GraphQLInt)},
                newPrice: {type: new GraphQLNonNull(GraphQLInt)},
                token: {type: new GraphQLNonNull(GraphQLString) }
            },
            async resolve(parent, args) { 
                decodedToken = await JSON.parse(atob(args.token.split('.')[1]));
                   updatedHotel =  hotelColl.findOne({name: args.hotelname }, function(err, result) {
                        let docSwap = new (mongoose.model('Hotel'))(result.toJSON()) //or result.toObject
                        if(decodedToken.id == result.hotelManager)
                        {
                            docSwap.rooms.forEach(room => {
                                if(room.number == args.roomnumber)
                                {
                                    room.price = args.newPrice;
                                }
                            });
                            result.remove()
                            docSwap.save()
                        }
                    })
                    return updatedHotel;
            }
        },  
        changesuitetype: { //changesuitetype
            type: HotelType,
            args: {
                //GraphQLNonNull make these field required
                hotelname: { type: new GraphQLNonNull(GraphQLString) },
                roomnumber: {type: new GraphQLNonNull(GraphQLInt)},
                newSuiteType: {type: new GraphQLNonNull(GraphQLString)},
                token: { type: new GraphQLNonNull(GraphQLString) }
            },
            async resolve(parent, args) { 
                decodedToken = await JSON.parse(atob(args.token.split('.')[1]));
                    updatedHotel = hotelColl.findOne({name: args.hotelname}, function(err, result) {
                        let docSwap = new (mongoose.model('Hotel'))(result.toJSON())
                        if(decodedToken.id == result.hotelManager)
                        {
                            docSwap.rooms.forEach(room => {
                                if(room.number == args.roomnumber)
                                {
                                    room.suitetype = args.newSuiteType;
                                }
                            });
                            result.remove()
                            docSwap.save()
                        }
                    })
                    return updatedHotel;
            }
        }
     }
});

//Creating a new GraphQL Schema, with options query which defines query 
//we will allow users to use when they are making request.
module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});