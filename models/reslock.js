const mongoose = require('mongoose');

const resourceSchema = mongoose.Schema({
    category: String,
    group: String,
    name: String,
    locked: Boolean,
    lockedBy: String,
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('resource', resourceSchema);