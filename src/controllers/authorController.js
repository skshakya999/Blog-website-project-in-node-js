const AuthorModel = require("../models/authorModel")
const jwt = require("jsonwebtoken")


const isValid = function (value) {

    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}


const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

const isValidateTitle = function (title) {
    return ['Mr', 'Mrs', 'Miss'].indexOf(title) !== -1
}

const createAuthor = async function (req, res) {
    try {
        let authorData = req.body
        if (!isValidRequestBody(authorData)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters, Please provide author detail' })
            return
        }

        const { fname, lname, title, email, password } = authorData

        if (!isValid(fname)) {
            res.status(400).send({ status: false, message: 'First name is required' })
            return
        }

        if (!isValid(lname)) {
            res.status(400).send({ status: false, message: 'Last name is required' })
            return
        }

        if (!isValid(title)) {
            res.status(400).send({ status: false, message: 'Title is required' })
            return
        }

        if (!isValidateTitle(title)) {
            res.status(400).send({ status: false, message: 'Title should be among Mr,Mrs,Miss' })
            return
        }

        if (!isValid(email)) {
            res.status(400).send({ status: false, message: 'Email is required' })
            return
        }

        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
            res.status(400).send({ status: false, message: 'Email should be a valid email address' })
            return
        }

        if (!isValid(password)) {
            res.status(400).send({ status: false, message: 'Password is required' })
            return
        }

        const isEmailAlreadyUsed = await AuthorModel.findOne({ email });

        if (isEmailAlreadyUsed) {
            res.status(400).send({ status: false, message: `${email} email address is already used` })
            return
        }

        const authorDetail = { fname, lname, title, email, password }

        let authorCreated = await AuthorModel.create(authorDetail)
        res.status(201).send({ status: true, message: 'Author created successfully', data: authorCreated })
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}


const loginAuthor = async function (req, res) {

    try {
        let authorDetail = req.body
        if (!isValidRequestBody(authorDetail)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters, Please provide login detail' })
            return
        }
        let { email, password } = authorDetail

        if (!isValid(email)) {
            res.status(400).send({ status: false, message: 'Email is required' })
            return
        }

        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
            res.status(400).send({ status: false, message: 'Email should be a valid email address' })
            return
        }

        if (!isValid(password)) {
            res.status(400).send({ status: false, message: 'Password is required' })
            return
        }

        const loginData = await AuthorModel.findOne({ email, password });


        if (!loginData) {
            res.status(401).send({ status: false, message: "Invalid login credentials" });
            return
        }


        let token = jwt.sign({
            authorId: loginData._id
        },
            "myverysecurekey1100@#123"
        );

        res.setHeader("x-api-key", token)
        res.status(200).send({ status: true, message: 'Author login successfull', data: token })
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}



module.exports.createAuthor = createAuthor
module.exports.loginAuthor = loginAuthor
