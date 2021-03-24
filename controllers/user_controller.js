const mongoose = require('mongoose');
const UserColl = mongoose.model('User');
const atob = require('atob');


//post user
module.exports.register = async function (req, res) {
    console.log('username:' + req.body.username);
    const username = req.body.username;
    const password = req.body.password;
    const password2 = req.body.password2;
    const role = req.body.role;
    console.log(' username ' + username+ ' pass:' + password + 'role: ' + role);
    if(!username || !password || !password2 || !role) {
        res.status(400).json({
            "title": "Invalid format",
            "detail": "All fields required"
        });
    }

    //check if match
    if(password !== password2) {
        console.log("password != password2");
        res.status(400).json({
            "title": "Invalid format",
            "detail": "Passwords dosen't match"
        });
    }
    
    //check if password is more than 6 characters
    if(password.length < 6 ) {
        console.log("password < 6");
        res.status(400).json({
            "title": "Invalid format",
            "detail": "Passwords too Short, should be more than 6 characters"
        });
    } else {
        //Create user.
        console.log('Creating user');
        const newUser = new UserColl({
            username: username,
            password: password,
            role: role
        });
        //const result = await newUser.setPassword(password);
        //console.log('password result: ' + result);
        newUser.save(function (err) {
            if(err) {
                res.status(400).json({
                    "title": "Failed to create user account",
                    "detail": `Failed to create user account because: ${err.message}.`
                });
            } else {
                const token = newUser.generateJwt();
                res.status(201).json({"token": token});
            }
        });
    }
};

//get login
module.exports.login = async function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    const user = await UserColl.findOne({username: username, password: password})
    .catch(err =>
        res.status(400).json({
            "title": "Failed to find user account",
            "detail": `Failed to find user account because: ${err.message}.`
        })
    )
    console.log('Found user' + user);
    
    if (user) {
        console.log('User found!');
        const token = user.generateJwt();
        res.status(200).json({
          "token": token
        });
    } else {
        res.status(401).json({
           "title": "Unauthorized",
           "detail": "Wrong password"
        });
    }

    //GraphQL
    /*
    mutation{
        userLogin( username: {username}, password: {password} ) {
            returning {

            }
        }
    }
    */
};

module.exports.changeRole = async function (req, res) {
    const username = req.body.username;
    const usernameToChange = req.body.usernameToChange;
    const roleToChange = "hotelmanager";
    const token = req.header('Authorization');
    const neededRoleToChangeOtherRoles = "administrator";

    if(!token)
    {
        res.status(401).json({
            "Information": "https://cutt.ly/1lXavhg",
            "Error": "unauthorized: You need to log in",
        });
    }

    decodedToken = JSON.parse(atob(token.split('.')[1]));

    console.log('Decoded token role= ' + decodedToken.role);

    if (decodedToken.role == neededRoleToChangeOtherRoles){
        //Search for user to change role
        var query = {username: usernameToChange};
        const newRoleToUser = await UserColl.findOneAndUpdate(query,
            {$set: {"role" : roleToChange}},
            function(err, doc) {
            if (err) console.log(err);
        }).catch(err => 
            res.status(400).json({
                "title": "Unable to change users role",
                "detail": err
            })
        );
        if(newRoleToUser != null) {
            res.status(201).json({
                "title": "Changed users role to hotelmanager",
                newRoleToUser
            });
        }
    }
    else
    {
        res.status(401).json({
            "Information": "https://cutt.ly/1lXavhg",
            "Error": "unauthorized: You're not of role 'administrator'",
        });
    }
};

module.export