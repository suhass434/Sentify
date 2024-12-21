import mongoose from 'mongoose';

const platformSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  service: {
    type: String,
    required: true
  },
  description: String,
  appId: String, // For Google Play Store identifier
  category: String,
  rating: Number
});

const Platform = mongoose.model('Platform', platformSchema);
export default Platform;
