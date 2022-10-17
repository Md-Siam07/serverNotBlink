const mongoose = require('mongoose');
const bycript = require('bcryptjs');
const jwt = require('jsonwebtoken');

var usreSchema = new mongoose.Schema({
    
    fullName:{
        type: String,
        required: 'Full name can\'t be emtpy',
        
    },
    email:{
        type: String,
        required: 'Email can\'t be emtpy',
        unique: true
        },
    password:{
        type: String,
        required: 'Password can\'t be empty',
        minlength: [6, 'Password must be atleast 6 character long']
    
    },
    institute:{
        type: String
    },
    batch:{
        type: Number
    },
    roll:{
        type: Number
    },
    phone_number:{
        type: String
    },
    isTeacher:{
        type: Boolean
    },
    designation:{
        type: String
    },
    verified:{
        type: Boolean,
        default: false
    },
    saltSecret: String
});

usreSchema.path('email').validate((val) =>{
    emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(val);
}, 'Invalid e-mail.')

usreSchema.pre('save', function(next){
    bycript.genSalt(10, (err, salt) => {
        bycript.hash(this.password, salt, (err, hash) =>{
            this.password = hash;
            this.saltSecret = salt;
            next();
        })
    })
})

//methods
usreSchema.methods.verifyPassword = function(password){
    return bycript.compareSync(password, this.password);
}

usreSchema.methods.generateJwt = function() {
    return jwt.sign( {_id: this._id},
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXP
        } );
}

mongoose.model('User', usreSchema);
