const express = require("express");
const mongoose = require("mongoose");
const postModel = require('../Models/postModel');
const authorModel = require('../Models/authorModel');
const commentModel = require('../Models/commentModel');
const verifyToken = require('../Middelwares/verify.token')
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const {CloudinaryStorage} = require('multer-storage-cloudinary');
const router = express.Router();



//CHIAMATA DI TIPO GET

router.get("/posts", async (req, res) => {
    const { page = 1, pageSize = 10 } = req.query;


    try {
        const posts = await postModel.find()
            .limit(pageSize)
            .skip((page - 1) * pageSize)
            .populate("author", "nome cognome email avatar")
            .populate("comment", "content")

        const totalPost = await postModel.count();

        res.status(200).send({
            statusCode: 200,
            totalPost: totalPost,
            posts: posts
        })

    } catch (error) {
        res.status(500).send({
            statusCode: 500,
            message: "Internal server error",
            error,
        })
    }
});

//CHIAMATA DI TIPO GET CON FILTRAGGIO ID 

router.get("/posts/:postId", async (req, res) => {
    const { postId } = req.params;
    try {
        const postById = await postModel.findById(postId);
        res.status(200).send({
            statusCode: 200,
            postById,
        })
    } catch (error) {
        res.status(500).send({
            statusCode: 500,
            message: "Internal server error",
            error,
        })
    }
});

//CHIAMATA DI TIPO GET CON FILTRAGGIO POST PER TITOLO

router.get("/posts/create/title", async (req, res) => {
    const { postTitle } = req.query;

    try {
        const postByTitle = await postModel.find({
            title: {
                $regex: ".*" + postTitle + ".*",
                //'I' sta per insensitiveCase
                $options: "i",
            },
        });
        console.log(postByTitle)
        if (!postByTitle || postByTitle.length <= 0) {
            return res.status(404).send({
                statusCode: 404,
                message: `Post with title: ${postTitle} not found`,
            })
        }
        res.status(200).send({
            statusCode: 200,
            postByTitle,
        })
    } catch (error) { }
});

//CHIAMATA DI TIPO POST 

router.post("/posts", verifyToken, async (req, res) => {
    const user = await authorModel.findOne({ _id: req.body.author });
    if (!user) {
        return res.status(404).send({
            statusCode: 404,
            message: "No authors found"
        })
    }
    const newPost = new postModel({
        author: user._id,
        ...req.body

    });

    try {
        const post = await newPost.save();
        await authorModel.updateOne({ _id: user._id }, { $push: { posts: post } })
        res.status(201).send({
            statusCode: 201,
            message: "Post saved successfully",
            payload: post
        })
    } catch (error) {
        res.status(500).send({
            statusCode: 500,
            message: "Internal server error",
            error,
        })
    }

});


//CHIAMATA DI TIPO PATCH

router.patch("/posts/:id", async (req, res) => {
    const id = req.params.id;
    const postExist = await postModel.findById(id);
    try {
        if (!postExist) {
            return res.status(404).send({
                statusCode: 404,
                message: `Post with ${id} not found`,
            })
        }
        const dataToUpdate = req.body;
        const options = { new: true };
        const result = await postModel.findByIdAndUpdate(id, dataToUpdate, options);
        res.status(200).send({
            statusCode: 200,
            message: `Post with ${id} updated`,
            result,
        })
    } catch (error) {
        res.status(500).send({
            statusCode: 500,
            message: "Internal server error",
            error,
        })
    }
});

//CHIAMATA DI TIPO DELETE

router.delete("/posts/:id", async (req, res) => {
    const { id } = req.params;
    const postExist = await postModel.findById(id);
    try {
        if (!postExist) {
            return res.status(404).send({
                statusCode: 404,
                message: `Post with ${id} not found`,
            })
        }
        const postToDelete = await postModel.findByIdAndDelete(id);
        res.status(201).send({
            statusCode: 200,
            message: `Post with id: ${id} delete successfully`
        })

    } catch (error) {
        res.status(500).send({
            statusCode: 500,
            message: "Internal server error",
            error,
        })
    }
});

//Ritorna tutti i commenti di un post specifico
router.get("/posts/:id/comment", async (req, res) => {
    const { id } = req.params;
    try {
        // Cerca il post per ID
        const post = await postModel.findById(id);

        if (!post) {
            return res.status(404).send({ message: "Post not found" });
        }

        // Trova tutti i commenti associati al post
        const comments = await commentModel.find({ _id: { $in: post.comment } }).populate("post");

        res.status(201).send({ 
            statusCode: 201,
            message: "comment found successfully",
            comments
        });
    } catch (error) {
        res.status(500).send({ message: "Server error" });
    }
});

//RITORNA UN COMMENTO SPECIFICO DI UN POST SPECIFICO

router.get("/post/:id/comment/:commentId", async (req, res) => {
    const { id, commentId } = req.params;
    try {
        const post = await postModel.findById(id);
        const comment = await commentModel.findById(commentId);
        if (!post) {
            return res.status(404).send({ message: "Post not found" });
        }
        if (!comment) {
            return res.status(404).send({ message: "Comment not found" });
        }

        // Verifica se il commento è associato al post corretto
        if (!post.comment.includes(commentId)) {
            return res.status(404).send({ message: "Comment not associated with this post" });
        }

        // Se tutto va bene, invia il commento trovato al client
        res.status(200).send({
            message: "Comment found successfully",
            comment,
        });

    } catch (error) {
        res.status(500).send({ message: "Internal server error" });
    }
})

//Aggiungi un commento ad un post specifico 
router.post("/posts/:id/comment", verifyToken, async (req, res) => {
    const { id } = req.params;
    const { author, content } = req.body;

    try {
        const post = await postModel.findById(id);

        if (!post) {
            return res.status(404).json({
                statusCode: 404,
                message: "Post not found",
            });
        }

        const newComment = new commentModel({
            author: author,
            content: content,
            post: post._id, // Collega il commento al post specificato
        });

        const savedComment = await newComment.save();

       // Aggiungi il commento al post.comment (array di commenti)
       post.comment.push(savedComment._id);

       // Salva il post aggiornato con il nuovo commento
       await post.save();

        // Popola l'autore nel documento del post con tutti i dettagli dell'autore
        await post.populate("author")


        res.status(201).send({
            statusCode: 201,
            message: "Comment saved successfully",
            savedComment,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            statusCode: 500,
            message: "Internal server error",
            error,
        });
    }
});

//MODIFICA UN COMMENTO DI UN POST SPECIFICO

router.patch("/posts/:id/comment/:commentId", async(req,res)=>{
    const {id, commentId} = req.params;
    try {
        const post = await postModel.findById(id);
        const comment = await commentModel.findById(commentId);
        if (!post) {
            return res.status(404).send({
                statusCode: 404,
                message: `Post with ${id} not found`,
            })
        }
        if (!comment) {
            return res.status(404).send({
                statusCode: 404,
                message: `Post with ${commentId} not found`,
            })
        }
        const dataToUpdate = req.body
        const options = { new: true };
        const result = await commentModel.findByIdAndUpdate(commentId, dataToUpdate, options);

        res.status(200).send({
            statusCode: 200,
            message: "Comment updated successfully",
            comment: result,
        });

    } catch (error) {
         res.status(500).send({
            statusCode: 500,
            message: "Internal server error",
            error,
        });
    }
});

//ELIMINA UN COMMENTO SPECIFICO

router.delete("/posts/:id/comment/:commentId", async(req,res)=>{
    const {id, commentId} = req.params;
    const commentExist = await commentModel.findById(commentId)
    const postExist = await postModel.findById(id)
    try {

        if (!commentExist){
            res.status(404).send({
                statusCode: 404,
                message: `Post with id: ${commentId} not found`
            })
        }
        if (!postExist){
            res.status(404).send({
                statusCode: 404,
                message: `Post with id: ${commentId} not found`
            })
        }

        const commentToDelete = await commentModel.findOneAndDelete({ _id: commentId });
        res.status(200).send({
            statusCode: 200,
            message: `Post with id: ${commentId} delete successfully`
        })

    } catch (error) {
        res.status(500).send({
            statusCode: 500,
            message: "Internal server error",
            error,
        })
    }
})

module.exports = router;