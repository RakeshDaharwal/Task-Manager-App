
const mongoose = require('mongoose');


const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  priorityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Priority', required: true },
  status: {
    type: String,
    enum: ['Pending', 'In-Progress', 'Complete'],
    default: 'Pending'
  },
  subTasks: {
    type: Array,
    default: []
  },
  dueDate: { type: Date },
  attachment: { type: String },
}, { timestamps: true });

taskSchema.index({ userId: 1 });
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, priorityId: 1 }); 
taskSchema.index({ title: 'text' }); 

module.exports = mongoose.model('Task', taskSchema);


