import mongoose from 'mongoose';

const chatSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true }
});

export default mongoose.model('ChatSession', chatSessionSchema);
