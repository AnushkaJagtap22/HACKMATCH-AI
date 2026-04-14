const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String, required: true },
  text: { type: String, required: true, maxlength: 1000 },
}, { timestamps: true });

const TeamChatSchema = new mongoose.Schema({
  teamId: { type: String, required: true, unique: true, index: true },
  messages: [MessageSchema]
}, { timestamps: true });

module.exports = mongoose.model('TeamChat', TeamChatSchema);
