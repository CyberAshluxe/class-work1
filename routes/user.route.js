const express = require('express')
const { getSignup, getDashboard, getRegister, postSignup, postSignin } = require('../controllers/user.controller')
const router = express.Router()


router.get('/signup', getSignup)

router.get("/dashboard", getDashboard)

router.post('/register', getRegister)

router.get('/signup', postSignup)

router.get('/signin', postSignin)


module.exports = router