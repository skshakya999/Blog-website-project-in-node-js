const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;


const blogSchema = new mongoose.Schema( {
    title:{
        type:String,
        required:'Title is required',
        trim:true
    },
    body:{
        type:String,
        required:'Body is required',
        trim:true
    },
    authorId:{
        type: ObjectId,
        ref: 'Author',
        required:'Blog author is required',
    },
    tags: [{type:String,trim:true}],
    category:{
        type:String,
        trim:true,
        required:'Blog category is required'
    },

    subcategory:[{type:String,trim:true}],

    isPublished: {
        type: Boolean, 
        default: false
    },

    publishedAt: {
        type: Date,
        default:null
     },
    isDeleted: {
        type: Boolean,
        default: false
     },
    deletedAt:{
        type: Date,
        default:null
    },
  
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema,'blogs')