const mongoose = require("mongoose")


const commentModel = new mongoose.Schema({

    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Author",
    },
    content : {
        type : String,
        required : true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Posts",
      },
},{timestamps :true, strict :true})

module.exports = mongoose.model("Comment", commentModel, "Comments");