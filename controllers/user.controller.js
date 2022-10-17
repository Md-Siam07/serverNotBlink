const mongoose = require('mongoose');
const passport = require('passport');
const _ = require('lodash');
const nodemailer = require('nodemailer')
const bcrypt = require('bcryptjs');
const UserOTPVerification = require('../models/UserOTPVerification');

const User = mongoose.model('User');

let transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    auth: {
        user: 'riad00311@hotmail.com',
        pass: 'riad85189934'
    }
})

module.exports.register = (req, res, next) => {
    var user = new User();
    user.fullName = req.body.fullName;
    user.email = req.body.email;
    user.password = req.body.password;
    user.institute = req.body.institute;
    user.isTeacher = req.body.isTeacher;
    user.designation = req.body.designation;
    user.phone_number = req.body.phone_number;
    user.batch = req.body.batch;
    user.roll =  req.body.roll;
    user.verified = false;
    user.save( 
        (err, doc) =>{
        if(!err){
            sendOTPVerificationEmail(doc, res)
        }
        else{
            if(err.code == 11000)
                res.status(422).send(['Duplicate email address found']);
            else
                return next(err);
        }} 
        )
}

module.exports.authenticate = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if(err) return res.status(400).json(err);
        else if(user) return res.status(200).json({"token": user.generateJwt()});
        else return res.status(404).json(info);
    })(req, res);
}

module.exports.userProfile = (req, res, next) => {
    User.findOne({ _id: req._id },
        (err, user) => {
            if(!user)
                return res.status(404).json({ status: false, message: "User record not found." });
            else
                return res.status(200).json({ status: true, user: _.pick(user, ['_id','fullName', 'email', 'isTeacher', 'institute', 'phone_number', 'batch', 'roll', 'designation']) });
        }
    );
}

module.exports.participantInfo = (req, res) => {
    User.findById(req.params.id, (err, doc) => {
        if(!err) res.send(doc);
        else {
            console.log(`Error in retriving user profile`);
        }
    } )
}

const sendOTPVerificationEmail = async ({_id, email}, res) => {
    try{
        const otp = `${Math.floor(100000 + Math.random()* 90000)}`;
        const mailOptions = {
            from: 'riad00311@hotmail.com',
            to: email,
            subject: 'Verify Your Email',
            html: `Enter <b>${otp}</b> to verify your email address and complete the sign up. The code Expires in <b>5 minutes<b>`
        };

        const saltRounds = 10;
        const hashedOTP = await bcrypt.hash(otp, saltRounds);

        const newOTPVerification = await new UserOTPVerification({
            userId: _id,
            otp: hashedOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() + 300000
        });

        await newOTPVerification.save();
        await transporter.sendMail(mailOptions);
        res.json({
            status: "PENDING",
            message: "Verification otp sent",
            data: {
                userId: _id,
                email
            }
        })
    }
    catch(error){
        res.json({
            status: "FAILED",
            message: error.message
        })
    }
}

module.exports.verifyOTP = async (req, res) => {
    flag = false;
    try{
        let {userId, otp} = req.body;
        if(!userId || !otp){
            throw Error("Empty otp details are not allowed");
        } else{

            const UserOTPVerificationRecords = await UserOTPVerification.find({
                userId
            });
            if(UserOTPVerificationRecords.length <= 0){
                throw new Error(
                    "Account doesn't exist. Please sign up or login"
                )
            }
            else{
                const {expiresAt} = UserOTPVerificationRecords[0];
                const hashedOTP = UserOTPVerificationRecords[0].otp;
                
                if(expiresAt < Date.now()){
                    await UserOTPVerification.deleteMany({userId});
                    await User.deleteMany({userId})
                    throw new Error("Code expired. Please request again")
                }
                else{
                    const validOTP = await bcrypt.compare(otp, hashedOTP);
                    if(!validOTP){
                        throw new Error("Invalid code. Please check your inbox");
                    }
                    else{
                        await User.updateOne( {_id: userId}, {verified: true});
                        await UserOTPVerification.deleteMany({userId});
                        res.json({
                            status: "VERIFIED",
                            message: 'User email verified'
                        });

                    }
                }
            }
        }
    
    } catch(error){
        res.json({
            status: "FAILED",
            message: error.message
        })
    }
}

module.exports.resendOTP = async (req, res) => {
    try{
        let {userId, email} = req.body;
        if(!userId || !email){
            throw Error("Empty user details not allowed");
        }else{
            await UserOTPVerification.deleteMany({userId})
            sendOTPVerificationEmail({_id: userId, email}, res)
        }
    }
    catch(error){
        res.json({
            status: "FAILED",
            message: error.message
        })
    }
}