import mongoose from 'mongoose';

const goalTrackingSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    goal: {
        type: String,
        required: true
    },
    progress: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
}, {timestamps: true});

const GoalTracking = mongoose.model('GoalTracking', goalTrackingSchema);

export default GoalTracking;
