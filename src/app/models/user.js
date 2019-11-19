const mongoose = require('../../database')
const bcrypt = require('bcryptjs')

//ROOT ACCOUNT
const userRootSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    ethAddress: {
        type: String,
        required: false,
        select: false
    },
    medicalRegisterAddress: [{
        type: String,
        required: false,
        select: false
    }],
    password: {
        type: String,
        required: true,
        select: false
    },
    passwordResetToken: {
        type: String,
        required: false,
        select: false
    },
    passwordResetExpires: {
        type: String,
        required: false,
        select: false
    },
    createDate: {
        type: Date,
        default: Date.now
    }
})

userRootSchema.pre('save', async function(next) {
    const hash = await bcrypt.hash(this.password, 10)
    this.password = hash

    next()
})

const UserRoot = mongoose.model('UserRoot', userRootSchema)

//DOCTOR ACCOUNT
const userDoctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    ethAddress: {
        type: String,
        unique: true,
        select: false
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    passwordResetToken: {
        type: String,
        select: false
    },
    passwordResetExpires: {
        type: String,
        select: false
    },
    createDate: {
        type: Date,
        default: Date.now
    }
})

userDoctorSchema.pre('save', async function(next) {
    const hash = await bcrypt.hash(this.password, 10)
    this.password = hash

    next()
})

const UserDoctor = mongoose.model('UserDoctor', userDoctorSchema)

//Client Account

const userClientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    ethAddress: {
        type: String,
        unique: true,
        select: false,
        required: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    passwordResetToken: {
        type: String,
        select: false
    },
    passwordResetExpires: {
        type: String,
        select: false
    },
    createDate: {
        type: Date,
        default: Date.now
    }
})

userClientSchema.pre('save', async function(next) {
    const hash = await bcrypt.hash(this.password, 10)
    this.password = hash

    next()
})

const UserClient = mongoose.model('UserClient', userClientSchema)

//EXPORT THE ACCOUNTS
module.exports = {
    UserRoot,
    UserDoctor,
    UserClient
}