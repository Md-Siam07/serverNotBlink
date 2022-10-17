const mongoose = require('mongoose');

var ExamSchema = new mongoose.Schema({
    examName:{
        type: String,
        required: 'Exam name can\'t be emtpy',
    },
    startTime:{
        type:String
    },
    duration:{
        type:Number
    },
    outSightTime:{
        type:Number
    },
    examDate:{
        type:String
    },
    message:{
        type:String
    },
    teacherID:{
        type: String
    },
    participants:{
        type: Array
    },
    blocked:{
        type: Array
    },
    teacherName:{
        type: String
    },
    question:{
        type: String
    },
    notification: [{
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
    }],
    answer: [{
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
        asnwerURL:{
            type: String
        }
    }]
});

mongoose.model('Exam', ExamSchema);