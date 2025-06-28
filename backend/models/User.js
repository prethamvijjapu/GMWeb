const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    likedBooks: { type: [Number], default: [] },         // Array of liked book IDs
    recommendedBooks: { type: [Number], default: [] }    // Array of recommended book IDs
});

module.exports = mongoose.model('User', UserSchema);
