import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,  
    trim: true        
  },
  phoneNumber: {
    type: String,
    required: true,    
    unique: true,    
  },
  companyName: {
    type: String,
    required: true  
  },
  companyMail: {
    type: String,
    required: true     
  },
  employeeSize: {
    type: String,
    required: true    
  },
  isEmailVerified:{
    type:Boolean,
    default:false
  },
  isPhoneVerified:{
    type:Boolean,
    default:false
  },
  password:{
    type:String
  },
  emailOtp: { type: String },
  phoneOtp: { type: String },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default  User;
