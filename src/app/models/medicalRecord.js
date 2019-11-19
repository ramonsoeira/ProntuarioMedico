const mongoose = require('../../database')

const medicalRecordSchema = new mongoose.Schema({
    contractAddress: {
        type: String,
        required: true,
        unique: true
    },
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserRoot',
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    }
})

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema)

module.exports = MedicalRecord