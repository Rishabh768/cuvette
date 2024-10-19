import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
  jobTitle: {
    type: String,
    required: true,
  },
  jobDesc: {
    type: String,
    required: true, 
  },
  experienceLevel: {
    type: String,
    required: true, 
    enum: ['Fresher', 'Mid-Level', 'Senior'],  
  },
  emails: [
    {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: props => `${props.value} is not a valid email!`
      }
    }
  ],
  endDate: {
    type: Date,
    required: true,  
  },
}, { timestamps: true }); 

const Interview = mongoose.model('Interview', interviewSchema);

export default Interview;
