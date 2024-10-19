import express from 'express'
import Interview from '../model/interview.model.js';
import nodemailer from 'nodemailer';
const router=express.Router();

router.post('/create-interview',async (req,res) => {
    
    const { jobTitle, jobDesc, experienceLevel, emails, endDate } = req.body;
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

  try {
    const interview = new Interview({ jobTitle, jobDesc, experienceLevel, endDate, emails });
    await interview.save();

    emails.forEach((email) => {
      const mailOptions = {
        from: process.env.Email,
        to: email,
        subject: `Interview for ${jobTitle}`,
        text: `You have been invited for an interview for the position of ${jobTitle}. Description: ${jobDesc}. Experience: ${experienceLevel}. Please respond by ${endDate}.`,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(`Error sending email to ${email}: `, error.message);
        } else {
          console.log(`Email sent to ${email}: `, info.response);
        }
      });

    });

    res.status(200).json({ message: 'Interview created and emails sent' });

  } catch (error) {
    console.error('Error creating interview:', error.message);
    res.status(500).json({ message: 'Error creating interview' });
  }
});

export default router;