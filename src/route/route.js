const express = require('express');
const route = express.Router()
const collegeController = require('../controller/collegeController')
const internController = require('../controller/internController')

route.post('/functionup/colleges', collegeController.createCollege)

route.post('/functionup/interns', internController.createIntern)

route.get('/functionup/collegeDetails', internController.getInterns)

module.exports = route;