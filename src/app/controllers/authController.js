const express = require('express')
const { UserRoot, UserClient } = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const secretApp = require('../../config/auth.json')
const crypto = require('crypto')
const mailer = require('../../modules/mailer')

const router = express.Router()

function tokenGenerate(params = {}) {
    return jwt.sign(params, secretApp.secret, {
        expiresIn: 86400
    })
}

module.exports = (app, web3) => {
    app.use('/auth', router)
    
    //ROOT
    router.post('/register_root', async (req, res) => {
        const { email } = req.body
        try {
            if (await UserRoot.findOne({ email })) {
                return res.status(400).send({ error: 'User already exists' })
            }
            
            const user = await UserRoot.create(req.body)

            

            // create and set the user address
            const _ethAddress = await web3.eth.personal.newAccount(req.body.password)
            await UserRoot.findByIdAndUpdate(user.id, {
                '$set': {
                    ethAddress: _ethAddress
                }
            })

            user.medicalRegisterAddress = undefined
            user.password = undefined
            
            return res.send({
                user,
                token: tokenGenerate({ id: user.id })
            })
        } catch(err) {
            return res.status(400).send({ error: err })
        }
    })
    
    router.post('/authenticate_root', async (req, res) => {
        const { email, password } = req.body
        const user = await UserRoot.findOne({ email }).select('+password')
        try {
            if (!user || !await bcrypt.compare(password, user.password)) {
                return res.send({ error: 'Email/password invalid' })
            }
            user.password = undefined
    
            return res.send({
                user,
                token: tokenGenerate({ id: user.id })
            })
        } catch(err) {
            return res.status(400).send({ error: 'Authenticate failed' })
        }
    })
    
    router.post('/forgot_password_root', async (req, res) => {
        const { email } = req.body
    
        try {
            const user = await UserRoot.findOne({ email })
    
            if(!user) return res.status(400).send({ error: 'User not found' })
    
            const token = crypto.randomBytes(20).toString('hex')
    
            const now = new Date()
            now.setHours(now.getHours+1)
    
            await UserRoot.findByIdAndUpdate(user.id, {
                '$set': {
                    passwordResetToken: token,
                    passwordResetExpires: now
                }
            })
            console.log('tudo ok')
            await mailer.sendMail({
                "from": '"Abade >:-(" <vini_abade@icloud.com>',
                "to": email,
                "subject": "Forgot password - Eletronic Medical Records",
                "template": "auth/forgotPassword",
                "context": { token }
            }, (err) => {
                console.log(err)
                if(err) return res.status(400).send({ error: 'Cannot send forgot password email' })
                return res.send({ token: token })
            })
    
        } catch(err) {
            console.log(err)
            res.status(400).send({ error: 'Error forgot password, try again' })
        }
    })
    
    router.post('/reset_password_root', async (req, res) => {
        const { email, token, password } = req.body
    
        try {
            const user = await UserRoot.findOne({ email })
                .select('+passwordResetToken passwordResetExpires')
            if(!user) return res.status(400).send({ error: 'User not found' })
            if(token !== user.passwordResetToken) return res.status(400).send({ error: 'Invalid Token.' })
            const now = new Date()
            if(user.passwordResetExpires < now) return res.status(400).send({ error: 'Expired token.' })
            user.password = password
            await user.save()
            res.send()
        } catch(err) {
            return res.status(400).send({ error: 'Cannot reset password, try again.' })
        }
    })
    
    
    
    
    
    //CLIENT
    router.post('/register_client', async (req, res) => {
        const { email } = req.body
        try {
            if (await UserClient.findOne({ email })) {
                return res.status(400).send({ error: 'User already exists' })
            }

            const user = await UserClient.create(req.body)

            const _ethAddress = await web3.eth.personal.newAccount(req.body.password)
            await UserClient.findByIdAndUpdate(user.id, {
                '$set': {
                    ethAddress: _ethAddress
                }
            })

            user.password = undefined
            
            return res.send({
                user,
                token: tokenGenerate({ id: user.id })
            })
        } catch(err) {
            return res.status(400).send({ error: 'Registration failed' })
        }
    })
    
    router.post('/authenticate_client', async (req, res) => {
        const { email, password } = req.body
        const user = await UserClient.findOne({ email }).select('+password')
        try {
            if (!user || !await bcrypt.compare(password, user.password)) {
                return res.send({ error: 'Email/password invalid' })
            }
            user.password = undefined
    
            return res.send({
                user,
                token: tokenGenerate({ id: user.id })
            })
        } catch(err) {
            return res.status(400).send({ error: 'Authenticate failed' })
        }
    })
    
    router.post('/forgot_password_client', async (req, res) => {
        const { email } = req.body
    
        try {
            const user = await UserClient.findOne({ email })
    
            if(!user) return res.status(400).send({ error: 'User not found' })
    
            const token = crypto.randomBytes(20).toString('hex')
    
            const now = new Date()
            now.setHours(now.getHours+1)
    
            await UserClient.findByIdAndUpdate(user.id, {
                '$set': {
                    passwordResetToken: token,
                    passwordResetExpires: now
                }
            })
            console.log('tudo ok')
            await mailer.sendMail({
                "from": '"Abade >:-(" <vini_abade@icloud.com>',
                "to": email,
                "subject": "Forgot password - Eletronic Medical Records",
                "template": "auth/forgotPassword",
                "context": { token }
            }, (err) => {
                console.log(err)
                if(err) return res.status(400).send({ error: 'Cannot send forgot password email' })
                return res.send({ token: token })
            })
    
        } catch(err) {
            console.log(err)
            res.status(400).send({ error: 'Error forgot password, try again' })
        }
    })
    
    router.post('/reset_password_client', async (req, res) => {
        const { email, token, password } = req.body
    
        try {
            const user = await UserClient.findOne({ email })
                .select('+passwordResetToken passwordResetExpires')
            if(!user) return res.status(400).send({ error: 'User not found' })
            if(token !== user.passwordResetToken) return res.status(400).send({ error: 'Invalid Token.' })
            const now = new Date()
            if(user.passwordResetExpires < now) return res.status(400).send({ error: 'Expired token.' })
            user.password = password
            await user.save()
            res.send()
        } catch(err) {
            return res.status(400).send({ error: 'Cannot reset password, try again.' })
        }
    })
}