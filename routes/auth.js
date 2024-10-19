import express from 'express'
import User from '../model/user.model.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer'
import twilio from 'twilio';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import verify from '../middleware/verify.js';
const router=express.Router();

dotenv.config()

const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendOTPSMS = async (phoneNumber, otp) => {
     const phone=`+91${phoneNumber}`
   await twilioClient.messages.create({
        body: `Your OTP code is ${otp}`,
        messagingServiceSid:process.env.TWILIO_MESSAGING_SERVICE_ID,
        to: phone
    })

};

const sendOTPEmail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        host:'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user:process.env.Email,
            pass:process.env.Pass
        }
    });

    const mailOptions = {
        from: 'thenewhub768@gmail.com',
        to: email,
        subject: 'OTP Verification',
        text: `Your OTP code is ${otp}`
    };

     await transporter.sendMail(mailOptions);
};

router.post('/register', async (req, res) => {

    try {
        const { name, phoneNumber,password, companyName, companyMail, employeeSize } = req.body;
        const existing= await User.findOne({companyMail});
        if(existing) return res.status(409).json({message:"Company already registered"});
        const emailOtp = generateOTP();
        const phoneOtp = generateOTP();
        const newUser = new User({
            name,
            phoneNumber,
            companyName,
            companyMail,
            employeeSize,
            password,
            emailOtp,
            phoneOtp
        });

        await newUser.save();
        
        await sendOTPEmail(newUser.companyMail,emailOtp);
        await sendOTPSMS(newUser.phoneNumber,phoneOtp);

        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        res.status(400).json({ message: 'Error registering user', error: error.message });
    }
});


router.post('/verify-phone',async (req,res)=>{
    try{
        const {phoneNumber,otp}=req.body;
        console.log(phoneNumber,"OTP of Phone Number",otp)
        const user=await User.findOne({phoneNumber});
        if(!user){
            return res.status(400).json({message:'User  not found'});
        }

        if (user.phoneOtp === otp) {
            user.isPhoneVerified = true;
            user.phoneOtp = null;
            await user.save();
            return res.status(200).json({ message: 'Phone verified successfully' });
        } else {
            return res.status(400).json({ message: 'Invalid  OTP' });
        }
    }catch(err){
        res.status(400).json({ message: 'Error verifying OTP', error: err.message });
    }
});
router.post('/verify-email', async (req, res) => {
    try {
        const { email, otp } = req.body;
         console.log(email,otp)
        const user = await User.findOne({ companyMail:email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }


        if (user.emailOtp === otp) {
            user.isEmailVerified = true;
            user.emailOtp = null;
            await user.save();
            return res.status(200).json({ message: 'Email verified successfully' });
        } else {
            return res.status(400).json({ message: 'Invalid  OTP' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Error verifying OTP', error: error.message });
    }

});

router.post('/signin',async(req,res)=>{
    const {email,password}=req.body;
try {
        const company = await User.findOne({ companyMail:email });
        if (!company) {
          return res.status(404).json({ message: 'Company not found' });
        }
        
        if (company.password != password) {
          return res.status(401).json({ message: 'Invalid password' });
        }
    
        const token = jwt.sign(
          { id: company._id, email: company.companyMail },
            process.env.JWT_SECRET,                    
          { expiresIn: '7d' }                        
        );

        res.json({ token, message: 'Login successful' });

} catch (error) {

    console.log(error);
    res.status(500).json({message:'Server error'})
}
})

router.get('/getme',verify ,async(req,res)=>{
    
    try {
        
        const company = await User.findById(req.company.id).select('-password');

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        res.json(company);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
})


export default router;