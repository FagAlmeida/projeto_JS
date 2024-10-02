const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    water_intake: { type: Number, default: 0 },
    room_id: { type: mongoose.Schema.Types.ObjectId, default: null }
});

module.exports = mongoose.model('Player', playerSchema);
