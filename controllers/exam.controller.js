const e = require('express');
const { response } = require('express');
const mongoose = require('mongoose');
const Exam = mongoose.model('Exam');
const multer = require('multer');
const Notification = mongoose.model('Notification');



module.exports.create = (req, res, next) => {
    const url = req.protocol + '://' + req.get('host')
    var exam = new Exam();
    exam.examName = req.body.examName;
    exam.startTime = req.body.startTime;
    exam.duration = req.body.duration;
    exam.examDate = req.body.examDate;
    exam.teacherID = req.body.teacherID;
    exam.teacherName = req.body.teacherName;
    exam.participants = [];
    exam.notification = [];
    exam.answer = [];
    if(!req.file)
        exam.question = '';
    else
        exam.question = url + '/public/' + req.file.filename;
    if(req.body.outSightTime == 'undefined'){
        req.body.outSightTime = tempOutSightTime;
    }
    exam.outSightTime = req.body.outSightTime;
    exam.save( (err, doc) =>{
        if(!err)
            res.send(doc);
        else 
            console.log('Error in Exam Save: ' + JSON.stringify(err, undefined, 2));
    }  );
}

module.exports.retrieve = (req, res, next) => {
    Exam.find({ teacherID: req.params.id }, (err, doc) =>{
        if(!err) res.send(doc);
        else {
            console.log(`Error in exam retrive: `+ JSON.stringify(err, undefined, 2));
        }
    } ) 
}

module.exports.getStudentExams = (req, res, next) => {
    Exam.find({ participants: req.params.id}, (err, doc) =>{
        if(!err) res.send(doc);
        else{
            console.log(`Error in retriving exam of students`);
        }
    })
}


module.exports.singleExamInfo = (req, res, next) => {
    Exam.findById(req.params.id, (err, doc) => {
        if(!err) res.send(doc);
        else {
            console.log(`Error in retriving exam` + + JSON.stringify(err, undefined, 2));
        }
    } )
}

module.exports.updateInfo = (req, res, next) => {
    const url = req.protocol + '://' + req.get('host')
    var tempQuestion, tempOutSightTime, tempAnswer;
    Exam.findById(req.params.id, (err, doc) => {
        if(!err) {
            tempQuestion = doc.question;
            tempOutSightTime = doc.outSightTime;
            tempAnswer = doc.answer;
        }
        else {
            console.log(`Error in updating exam`);
        }
    } )
    if(req.file){
        tempQuestion = url + '/public/' + req.file.filename;
    }
    if(req.body.outSightTime == 'undefined'){
        req.body.outSightTime = tempOutSightTime;
    }
    var exam = {
        examName: req.body.examName,
        participants: req.body.participants,
        startTime: req.body.startTime,
        duration: req.body.duration,
        examDate: req.body.examDate,
        teacherID: req.body.teacherID,
        teacherName: req.body.teacherName,
        question : tempQuestion,
        answer: tempAnswer,
        outSightTime: req.body.outSightTime
    };

    Exam.findByIdAndUpdate(req.params.id, { $set:exam }, { new:true } , (err, doc) => {
        if(!err) {res.send(doc);}
        else{
            console.log(`Error in exam update: `+ JSON.stringify(err, undefined, 2));
        }
    });
}

module.exports.deleteExam = (req, res, next) => {
    Exam.findByIdAndDelete(req.params.id, (err, doc) => {
        if(!err) { res.send(doc); }
        else { console.log('Error in exam delete: ' + JSON.stringify(err, undefined, 2)); }
    })
}

module.exports.joinExam = (req, res, next) => {
    var userID = req.body.userID;
    Exam.findById(req.params.id, (err, document) =>{
        if(!err){
            console.log('document bloced: ', document.blocked)
            if(document.blocked.indexOf(userID)>-1){
                res.send('user blocked')
            }else{
                Exam.findByIdAndUpdate(req.params.id, {$addToSet: {participants: userID}}, {new:true}, (err, doc) =>{
                if(!err) {res.send(doc);}
                else{
                    console.log(`Error in exam join: `+ JSON.stringify(err, undefined, 2));
                    }
                } )
            }
        }
    })
    
}

module.exports.removeParcipant = (req, res, next) => {
    var userID = req.body.userID;
    Exam.findByIdAndUpdate(req.params.id, {$pull: {participants: {$in: [req.body.userID]}}}, {new:true}, (err, doc) =>{
        if(!err) {
            Exam.findByIdAndUpdate(req.params.id,  {$addToSet: {blocked: userID}}, {new:true}, (error, document) => {
                if(!error){
                    console.log('participant added in blocked list');
                    res.send(document);
                }
            })
        }
        else{
            console.log(`Error in exam leave: `+ JSON.stringify(err, undefined, 2));
        }
    } )
}


module.exports.addEvidence = (req, res, next) => {
    const url = req.protocol + '://' + req.get('host');
    var notification = new Notification();
    notification.fullName = req.body.fullName;
    notification.email = req.body.email;
    notification.institute = req.body.institute;
    notification.roll = req.body.roll;
    notification.phone_number = req.body.phone_number;
    notification.time = Date.now;
    notification.message = req.body.message;
    if(req.body.screenRecord == '' && req.body.cameraRecord == ''){
        notification.cameraRecord = '';
        notification.screenRecord = '';
    }
    else if(req.body.screenRecord != ''){
        notification.screenRecord = url + '/public/' + req.file.filename;
        notification.cameraRecord = '';
    }
    else {
        notification.screenRecord = '';
        notification.cameraRecord = url + '/public/' + req.file.filename;
    }
    if(notification.message != 'undefined')
        Exam.findByIdAndUpdate(req.params.id, {$push: {notification: notification}}, {new:true}, (err, doc) => {
            if(!err) {
                console.log(notification)
                res.send(doc);}
            else{
                console.log(`Error in add evidence: `+ JSON.stringify(err, undefined, 2));
            }
        })
}

module.exports.getNotification = (req, res, next) => {
    Exam.findById(req.params.id, (err, doc) => {
        if(!err) res.send(doc.notification);
        else {
            console.log(`Error in retriving notification`);
        }
    } )
}

module.exports.addAnswer = (req, res, next) => {
    const url = req.protocol + '://' + req.get('host');
    var answer = {
        fullName: req.body.fullName,
        email: req.body.email, 
        institute: req.body.institute,
        batch: req.body.batch,
        roll: req.body.roll,
        phone_number: req.body.phone_number,
        asnwerURL: screenRecord = url + '/public/' + req.file.filename
    };
    Exam.findByIdAndUpdate(req.params.id, )
}
