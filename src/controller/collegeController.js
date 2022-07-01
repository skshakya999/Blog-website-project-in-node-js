const collegeModel = require('../model/collegeModel')
const validator = require('validator')

const nullValue = function (value) {

    if (value == undefined || value == null) return true
    if (typeof value !== 'string' || value.trim().length == 0) return true
    return false
}

//=========================== Create college ===========================================================

const createCollege = async function (req, res) {
    const { name, fullName, logoLink } = req.body
    try {

        if (Object.keys(req.body).length == 0) {
            return res.status(400).send({ status: false, message: "Kindly enter your details." })
        }


        let final = {}
        if (nullValue(name)) {
            return res.status(400).send({ status: false, message: "Invalid College name or college name is not mentioned." })
        }
        if (!/^[a-zA-Z]{3,10}$/.test(name)) {
            return res.status(400).send({ status: false, message: "Invalid College Name" })
        }
        // let lowerCase = name.toLowerCase()
        const duplicateName = await collegeModel.findOne({ name: name.toLowerCase() }) //findOne will give us null so null is used as false in boolean
        if (duplicateName) {
            return res.status(400).send({ status: false, message: "The college name is already there, you can directly apply for the internship." })
        }
        final.name = name.toLowerCase()


        if (nullValue(fullName)) {
            return res.status(400).send({ status: false, message: "Invalid College full name or College full name is not mentioned." })
        }
        if (!/^[a-zA-Z ,]{3,50}$/.test(fullName)) {
            return res.status(400).send({ status: false, message: "Invalid College full name" })
        }
        const duplicateFullName = await collegeModel.findOne({ fullName: fullName })
        if (duplicateFullName) {
            return res.status(400).send({ status: false, message: "The college full name is already there, you can directly apply for the internship." })
        }
        final.fullName = fullName


        if (nullValue(logoLink)) {
            return res.status(400).send({ status: false, message: "Invalid College Logolink or College Logolink is not mentioned." })
        }
        if (!validator.isURL(logoLink)) {
            return res.status(400).send({ status: false, message: "The logoLink is not valid." })
        }
        final.logoLink = logoLink


        let saveData = await collegeModel.create(final)

        let data = { name: saveData.name, fullName: saveData.fullName, logoLink: saveData.logoLink, isDeleted: saveData.isDeleted }

        return res.status(201).send({ status: true, data: data })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}
module.exports.createCollege = createCollege