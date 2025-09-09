const mongoose = require('mongoose')


let customerSchema = mongoose.Schema({
    firstName: {type: String, require: true},
    lastName: {type: String, require: true},
    email: {type: String, require: true, unique: [true, 'Email has been taken, please choose another one']},
    password: {type: String, require: true}
});


module.exports = mongoose.model('Customer', customerSchema);