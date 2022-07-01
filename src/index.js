const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const route = require('./route/route');
const app = express();

app.use(bodyParser.json())

mongoose.connect("mongodb+srv://Sumit:Shakya123@cluster0.of12ajb.mongodb.net/Group_53_Database", {
        useNewUrlParser: true
    })
    .then(() => console.log("MongoDb is connected"))
    .catch(err => console.log(err))

app.use('/', route)

app.listen(process.env.PORT || 3000, function() {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});
