const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema ({
    resort: {
        type: String,
        enum: ['WDW', 'DLR'],
        required: true
    },
    park: {
        type: String,
        enum: ['DP', 'CA', 'MK', 'EP', 'AK', 'HS', 'ANY'],
        required: true,
        default: 'ANY'
    },
    pass: {
        type: String,
        enum: ['inspire-key-pass', 'believe-key-pass', 'dream-key-pass', 'imagine-key-pass', 'enchant-key-pass', 
        'disney-incredi-pass', 'disney-sorcerer-pass', 'disney-pirate-pass', 'disney-pixie-dust-pass'],
        required: true
    },
    
    date: {
        type: String, 
        required: true
    },
    available: {
        type: Boolean,
        required: true,
        default: false
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
});

module.exports = requestSchema;