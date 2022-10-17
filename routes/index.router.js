const express = require('express');
const router = express.Router();
const multer = require('multer');

const userController = require('../controllers/user.controller');
const examController = require('../controllers/exam.controller');
const emailController = require('../controllers/email.controller');
const imageVerificationController = require('../controllers/imageVerification.controller')
const jwtHelper = require('../config/jwtHelper');

const DIR = './public/'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR)
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(' ').join('-')
    cb(null, fileName)
  },
})
  
const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype == 'application/pdf') {
      cb(null, true);
    } else {
      cb(null, false);
    }
};

const upload = multer({
    storage: storage,
});

router.use(express.static(__dirname + "./public/"));

router.post('/register', userController.register);
router.post('/authenticate', userController.authenticate);
router.get('/userProfile', jwtHelper.verifyJwtToken ,userController.userProfile);
router.post('/createExam', upload.single('question'), examController.create);
router.get('/exams/:id', examController.retrieve);
router.get('/exam/:id', examController.singleExamInfo);
router.put('/exam/:id',upload.single('question'), examController.updateInfo);
router.delete('/exams/:id', examController.deleteExam);
router.put('/joinExam/:id', examController.joinExam);
router.get('/student/exams/:id', examController.getStudentExams);
router.put('/student/exams/:id', examController.removeParcipant);
router.post('/invite', emailController.sendMail);
router.get('/participantinfo/:id', userController.participantInfo);
router.put('/addEvidence/:id', upload.single('record') ,examController.addEvidence);
router.get('/exam/notifications/:id', examController.getNotification)
router.post('/verifyOTP', userController.verifyOTP)
router.post('/resendOTP', userController.resendOTP)
router.post('/verifyImage', upload.single('image'), imageVerificationController.verifyImage)

module.exports = router;

// {
//     "examName": "exam1",
//     "startTime": "09.30",
//     "duration": 120,
//     "teacherID": "1234",
//     "examDate": "1 May 2020",
//     "message": ""
// }