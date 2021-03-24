const mongoose = require('mongoose');
//const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
//const saltrounds = 10;

const userSchema = new mongoose.Schema({
    username: {
    type: String,
    unique: true,
    required: true
    },
    password: {
    type: String,
    required: true
    },
    hash: String,
    role: {
        type: String,
        enum : ['bruger','administrator', 'hotelmanager', 'guest'],
        default: 'bruger'
    }
});

userSchema.methods.generateJwt = function () {
    let expiry = new Date();
    expiry.setDate(expiry.getDate() + 1); // Use 1 hour for better security
    
    return jwt.sign({
        id: this._id,
        username: this.username,
        role: this.role,
        exp: parseInt(expiry.getTime() / 1000), // as Unix time in seconds,
    }, process.env.JWT_SECRET);
};

//Encrypting password
// userSchema.methods.setPassword = async function (password) {
//     this.hash = await bcrypt.hashSync(password, saltrounds);
// };

// //Compare passwords
// userSchema.methods.validPassword = async function ( password) {
//     return await bcrypt.compareSync(password, this.hash);
// };

const User = mongoose.model('User', userSchema);

module.exports = User;