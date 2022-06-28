const jwt = require("jsonwebtoken");


const authorise = async function (req, res, next) {
    try {
        const token = req.headers["x-api-key"];

        if (!token) {
            res.status(403).send({ status: false, message: "Token is required" })
            return
        }
       
        let decodeToken = jwt.verify(token, "myverysecurekey1100@#123")
       
        if (!decodeToken) return res.status(401).send({ status: false, msg: "Invalid token!`" })

        req.authorid = decodeToken.authorId

        next()
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}


module.exports.authorise = authorise
