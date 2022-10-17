require('./config/config')
require('./models/db');
require('./config/passportConfig');
require('./models/notification');
const mongoose = require('mongoose');
const Exam = mongoose.model('Exam');
const Notification = mongoose.model('Notification');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');

const routeIndex = require('./routes/index.router');

var app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: '*'
});

//middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(cors());
app.use('/public', express.static('public'))
app.use(passport.initialize());
app.use('/api', routeIndex);


//error handler
app.use((err, req, res, next) => {
    if(err.name == 'ValidationError'){
        var valErrors = [];
        Object.keys(err.errors).forEach( key => valErrors.push(err.errors[key].message) );
        res.status(422).send(valErrors)
    }
});

//start server
server.listen(process.env.PORT, () => console.log(`Server started at port: ${process.env.PORT}`));

let userList = new Map();

io.on('connection', (socket) => {
  var name = '', email = '', examID = '';
  socket.on('notification', notification =>{
    io.emit('notification', notification);
  })

  let userName = socket.handshake.query.userName;
  //console.log(name)
    addUser(name, socket.id);

    socket.broadcast.emit('user-list', [...userList.keys()]);
    socket.emit('user-list', [...userList.keys()]);

    socket.on('message', (msg) => {
        socket.broadcast.emit('message-broadcast', {message: msg, userName: name});
    })

  socket.on('join', user=> {
    var notification = new Notification();
    notification.fullName = user.fullName;
    notification.email = user.email;
    notification.time = Date.now;
    notification.phone_number = user.phone_number;
    notification.roll = user.roll;
    notification.batch  = user.batch;
    notification.institute = user.institute;
    notification.cameraRecord = '';
    notification.screenRecord = '';
    notification.message = 'Started the exam';
    if (!examID.match(/^[0-9a-fA-F]{24}$/)) {
    }
    else{
      Exam.findOneAndUpdate( {_id: examID}, {$push:{notification:notification}}, {new:true}, (err, res) =>{
        if(res) 
          console.log('add disc successfully')
        else
          console.log('err in disconnect ', JSON.stringify(err, undefined,2))
      })
    }

  })

  socket.on('newUser', userName => {
    name = userName;
  })

  socket.on('newUserEmail', iemail => {
    email = iemail;
  })

  socket.on('examID', exID =>{
    examID = exID;
  })

  socket.on('disconnect', () => {
    var notification = new Notification();
    notification.fullName = name;
    notification.email = email;
    notification.time = Date.now;
    notification.phone_number = '';
    notification.roll = 0;
    notification.batch  = 0;
    notification.institute = '';
    notification.cameraRecord = '';
    notification.screenRecord = '';
    notification.message = 'Got disconnected';
    removeUser(userName, socket.id)
    if (!examID.match(/^[0-9a-fA-F]{24}$/)) {
      // invalid id
    }
    else{
      if(name != '' && email != '')
        Exam.findOneAndUpdate( {_id: examID}, {$push:{notification:notification}}, {new:true}, (err, res) =>{
          if(res) {

          }
          else
            console.log('err in disconnect ', JSON.stringify(err, undefined,2))
        })
    }
  })
})

function addUser(userName, id) {
  if (!userList.has(userName)) {
      userList.set(userName, new Set(id));
  } else {
      userList.get(userName).add(id);
  }
}

function removeUser(userName, id) {
  if (userList.has(userName)) {
      let userIds = userList.get(userName);
      if (userIds.size == 0) {
          userList.delete(userName);
      }
  }
}