const BlogModel = require("../models/blogModel");
const mongoose = require('mongoose');

const isValidObjectId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

const createBlog = async function (req, res) {
    try {

        let blog = req.body

        if (!isValidRequestBody(blog)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters, Please provide blog detail' })
            return
        }

        const { title, body, authorId, tags, category, subcategory, isPublished } = blog

        if (!isValid(title)) {
            res.status(400).send({ status: false, message: 'Blog title is require' })
            return
        }
        if (!isValid(body)) {
            res.status(400).send({ status: false, message: 'Blog body is require' })
            return
        }

        if (!isValid(authorId)) {
            res.status(400).send({ status: false, message: 'Author Id is require' })
            return
        }
        if (!isValidObjectId(authorId)) {
            res.status(400).send({ status: false, message: `${authorId} is not a valid author id` })
            return
        }

        if (!isValid(category)) {
            res.status(400).send({ status: false, message: 'Blog category is require' })
            return
        }

        const blogData = {
            title,
            body,
            authorId,
            category,
            isPublished: isPublished ? isPublished : false,
            publishedAt: isPublished ? new Date() : null,
        }

        if (tags) {
            if (Array.isArray(tags)) {
                blogData['tags'] = [...tags]
            }
            if (Object.prototype.toString.call(tags) == '[object String]') {
                blogData['tags'] = [tags]
            }
        }

        if (subcategory) {
            if (Array.isArray(subcategory)) {
                blogData['subcategory'] = [...subcategory]
            }
            if (Object.prototype.toString.call(subcategory) == '[object String]') {
                blogData['subcategory'] = [subcategory]
            }
        }

        let newBlog = await BlogModel.create(blogData)

        res.status(201).send({ status: true, message: 'New blog created successfully', data: newBlog })
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}


const getBlogs = async function (req, res) {
    try {
        const filterQuery = { isDeleted: false, isPublished: true }
        const queryParams = req.query

        if (isValidRequestBody(queryParams)) {
            const { authorId, category, tags, subcategory } = queryParams

            if (isValid(authorId) && isValidObjectId(authorId)) {
                filterQuery['authorId'] = authorId
            }


            if (isValid(category)) {
                filterQuery["category"] = category.trim();
            }

            if (isValid(tags)) {
                const tagArr = tags.trim().split(',').map(tag => tag.trim())
                filterQuery["tags"] = { $all: tagArr }
            }

            if (isValid(subcategory)) {
                const subcatArr = subcategory.trim().split(',').map(subcat => subcat.trim())
                filterQuery["subcategory"] = { $all: subcatArr }
            }

            const blogs = await BlogModel.find(filterQuery)
         
            if (Array.isArray(blogs) && blogs.length === 0) {
                return res.status(404).send({ status: false, message: "No blog found" })

            }
            res.status(200).send({ status: true, message: 'Blog List', data: blogs })

        } else (
            res.status(400).send({ status: false, message: 'Please enter valid query' })
        )
    }
    catch (err) {
        
        res.status(500).send({ status: false, message: err.message })
    }


}





const updateBlog = async function (req, res) {

    try {
        const requestBody = req.body
        const params = req.params
        const blogId = params.blogId
        const authorIdFromToken = req.authorid


        if (!isValidObjectId(blogId)) return res.status(400).send({ status: false, message: `${blogId} is not a valid blog Id` })

        

        if (!isValidObjectId(authorIdFromToken)) return res.status(400).send({ status: false, message: `${authorIdFromToken} is not a valid Author Id` })


        const blog = await BlogModel.findOne({ _id: blogId, isDeleted: false, deletedAt: null })

        if (!blog) {
            res.status(404).send({ status: false, message: `Blog not found` })
            return
        }
        if (blog.authorId.toString() !== authorIdFromToken) {
            res.status(401).send({ status: false, message: `Unauthorized access! owner detail does't match` })
            return
        }



        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'No parameter passed, blog unmodified', data: blog })
        }

        const { title, body, tags, category, subcategory, isPublished } = requestBody

        const updateBlogData = {}




        if (isValid(title)) {
            if (!Object.prototype.hasOwnProperty.call(updateBlogData, '$set')) updateBlogData['$set'] = {}
            updateBlogData['$set']['title'] = title
        }
        if (isValid(body)) {
            if (!Object.prototype.hasOwnProperty.call(updateBlogData, '$set')) updateBlogData['$set'] = {}
            updateBlogData['$set']['body'] = body
        }
        if (isValid(category)) {
            if (!Object.prototype.hasOwnProperty.call(updateBlogData, '$set')) updateBlogData['$set'] = {}
            updateBlogData['$set']['category'] = category
        }

        if (isPublished !== undefined) {
            if (!Object.prototype.hasOwnProperty.call(updateBlogData, '$set')) updateBlogData['$set'] = {}
            updateBlogData['$set']['isPublished'] = isPublished
            updateBlogData['$set']['publishedAt'] = isPublished ? new Date() : null
        }

        if (tags) {
            if (!Object.prototype.hasOwnProperty.call(updateBlogData, '$addToSet')) updateBlogData['$addToSet'] = {}

            if (Array.isArray(tags)) {
                updateBlogData['$addToSet']['tags'] = { $each: [...tags] }
               
            }
            
            if (typeof tags === 'string') {
                updateBlogData['$addToSet']['tags'] = tags
            }
        }
        if (subcategory) {
            if (!Object.prototype.hasOwnProperty.call(updateBlogData, '$addToSet')) updateBlogData['$addToSet'] = {}

            if (Array.isArray(subcategory)) {
                updateBlogData['$addToSet']['subcategory'] = { $each: [...subcategory] }
            }
            if (typeof subcategory === 'string') {
                updateBlogData['$addToSet']['subcategory'] = subcategory
            }
        }



        let updatedBlog = await BlogModel.findOneAndUpdate({ _id: blogId }, updateBlogData, { new: true })
        if (!updatedBlog) return res.status(404).send({ status: false, message: "No blog found!" })
        res.status(200).send({ status: true, message: 'Blog Updated Successfully', data: updatedBlog })

    }
    catch (err) {
       
        res.status(500).send({ status:false,message: err.message })
    }
}


const deleteBlogById = async function (req, res) {
    try {
        const blogId = req.params.blogId
        const authorIdFromToken = req.authorid

        if (!isValidObjectId(blogId)) return res.status(400).send({ status: false, message: `${blogId} is not a valid blog id` })

        if (!isValidObjectId(authorIdFromToken)) return res.status(400).send({ status: false, message: `${authorIdFromToken} is not a valid authot id` })

        const blog = await BlogModel.findOne({ _id: blogId, isDeleted: false, deletedAt: null })

        if (!blog) {
            res.status(404).send({ status: false, message: 'Blog not found' })
            return
        }

        if (blog.authorId.toString() !== authorIdFromToken) {
            res.status(401).send({ status: false, message: 'Unauthorized access!, User detail not mached' })
            return
        }
        await BlogModel.findOneAndUpdate({ _id: blogId }, { $set: { isDeleted: true, deletedAt: new Date() } })

        res.status(200).send({ status: true, message: 'Blog deleted successfully' })
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

const deleteBlogByParams = async function (req, res) {

    try {
        const filterQuery = { isDeleted: false, deletedAt: null }
        const queryParams = req.query
        const authorIdFromToken = req.authorid

        if (!isValidObjectId(authorIdFromToken)) return res.status(400).send({ status: false, msg: `${authorIdFromToken} is not a valid author id` })

        if (!isValidRequestBody(queryParams)) {
            res.status(400).send({ status: false, message: 'No parameter recieved, aborting delete operation' })
            return
        }

        const { authorId, category, tags, subcategory, isPublished } = queryParams

        if (isValid(authorId) && isValidObjectId(authorId)) {
            filterQuery['authorId'] = authorId
        }

        if (isValid(category)) {
            filterQuery['category'] = category.trim()
        }
        if (isValid(isPublished)) {
            filterQuery['isPublished'] = isPublished
        }
        if (isValid(tags)) {
            const tagArr = tags.trim().split(',').map(tag => tag.trim());
            filterQuery['tags'] = { $all: tagArr }
        }

        if (isValid(subcategory)) {
            const subcatArr = subcategory.trim().split(',').map(subcat => subcat.trim());
            filterQuery['subcategory'] = { $all: subcatArr }
        }

        const blogs = await BlogModel.find(filterQuery)

        if (Array.isArray(blogs) && blogs.length === 0) {
            res.status(404).send({ status: false, message: 'No matching blog found' })
        }
        

        const idsOfBlogToDelete = blogs.map(blog => {
            if (blog.authorId.toString() === authorIdFromToken) return blog._id
        })

       
        if (idsOfBlogToDelete.length === 0) {
            res.status(404).send({ status: false, message: 'No blog found' })
            return
        }

        await BlogModel.updateMany({ _id:idsOfBlogToDelete }, { isDeleted: true, deletedAt: new Date()  })
       
        res.status(200).send({ status: true, message: 'Blog(s) deleted successfully' });
    }

    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }


}


module.exports.createBlog = createBlog
module.exports.updateBlog = updateBlog
module.exports.deletePost = deleteBlogById
module.exports.deletePostQuery = deleteBlogByParams
module.exports.getBlogs = getBlogs
