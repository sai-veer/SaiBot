import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  theme: { type: String, default: 'dark' },
  avatarType: { type: String, enum: ['image', 'emoji'], default: 'emoji' },
  avatarEmoji: { type: String, default: '🙂' },
  avatarUrl: { type: String, default: '' }
});

export default mongoose.model('User', userSchema);
