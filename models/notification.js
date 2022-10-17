const mongoose = require('mongoose');

var NotificationSchema = new mongoose.Schema({
    
    fullName: String,
    email: String, 
    institute: String,
    batch: Number,
    roll: Number,
    phone_number: String,
    
    time:{
        type: Date,
        default: Date.now
    },
    cameraRecord:{
        type: String
    },
    screenRecord:{
        type: String
    },
    message:{
        type: String
    }
    
});

mongoose.model('Notification', NotificationSchema);