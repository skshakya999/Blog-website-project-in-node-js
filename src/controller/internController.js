const internModel = require('../model/internModel')
const validator = require('validator')

const collegeModel = require('../model/collegeModel')



const nullValue = function (value) {

    if (value == undefined || value == null) return true
    if (value.trim().length == 0) return true
    return false
}

const createIntern = async function(req, res) {
    try {
        let result = {}
        const { name, email, mobile, collegeName } = req.body

        if (Object.keys(req.body).length == 0) {
            return res.status(400).send({ status: false, message: "Kindly enter your details." })
        }
        if (!/^[a-zA-Z ]{3,20}$/.test(name)) {
            return res.status(400).send({ status: false, message: "Intern name is not valid" })
        }
        if (nullValue(name)) {
            return res.status(400).send({ status: false, message: "Invalid intern name or intern name is not mentioned." })
        }
        result.name = name


        if (nullValue(email)) {
            return res.status(400).send({ status: false, message: "Invalid intern email or intern email is not mentioned." })
        }
        if (!validator.isEmail(email)) {
            return res.status(400).send({ status: false, message: "Intern email is incorrect" })
        }
        let duplicateEmail = await internModel.findOne({ email: email }) //findOne will give us null so null is used as false in boolean
        if (duplicateEmail) {
            return res.status(400).send({ status: false, message: "Intern email already exists." })
        }
        result.email = email


        if (mobile == undefined || mobile == null) {
            return res.status(400).send({ status: false, message: "Intern mobile is not mentioned." })
        }
        if (!/^[6-9]{1}[0-9]{9}$/.test(mobile)) {
            return res.status(400).send({ status: false, message: "Intern mobile number not valid" })
        }
        let duplicateMobile = await internModel.findOne({ mobile: mobile })
        if (duplicateMobile) {
            return res.status(400).send({ status: false, message: "Intern mobile number already exists." })
        }
        result.mobile = mobile


        if (!/^[a-zA-Z ]{3,20}$/.test(collegeName)) {
            return res.status(400).send({ status: false, message: "College name is not valid" })
        }
        if (nullValue(collegeName)) {
            return res.status(400).send({ status: false, message: "Invalid intern name or intern name is not mentioned." })
        }
        let collegeId = await collegeModel.findOne( {name: collegeName }).select({ _id: 1 })
        if (!collegeId) {
            return res.status(400).send({ status: false, message: "Enter a valid college name." })
        }
        
        result.collegeId = collegeId._id
       
        let saveData = await internModel.create(result)
        let data = {isDeleted:saveData.isDeleted,name:saveData.name,email:saveData.email,mobile:saveData.mobile,collegeId:saveData.collegeId}
        return res.status(201).send({ status: true, data:data })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

//============================ Get Interns ===========================================================================

const getInterns = async function(req, res) {
    try {
        let collegeName = req.query.collegeName

        if (nullValue(collegeName)) {
            return res.status(400).send({ status: false, message: 'College name is not mentioned.' })
        }

        let collegeId = await collegeModel.findOne({ name: collegeName.toLowerCase() }).select({ _id: 1, name: 1, fullName: 1, logoLink: 1 })
        if (!collegeId) {
            return res.status(404).send({ status: false, message: "No such College is available" })
        }


        let intern = await internModel.find({ collegeId: collegeId._id }).select({ _id: 1, name: 1, email: 1, mobile: 1 })
        if (intern.length == 0) {
            return res.status(404).send({ status: false, message: "No intern have applied to this college!"  })
        }
        let data= {name:collegeId.name,fullName:collegeId.fullName,logoLink:collegeId.logoLink,interns:intern}
        
        return res.status(200).send({ status: true, data })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports.createIntern = createIntern
module.exports.getInterns = getInterns