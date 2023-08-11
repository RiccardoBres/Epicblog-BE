const express = require("express");
const mongoose = require("mongoose");
const authorModel = require("../Models/authorModel");
const postModel = require("../Models/postModel");
const bcrypt = require('bcrypt');
const Avatar = require('../Middelwares/UploadAuthors')


const author = express.Router();

/* 
il primo parametro sarà sempre il nostro endpoint
il secondo sarà una callback che avrà sempre quei parametri(con request otterremo le informazioni di chi ha interrogato questo endpoint,
    con response è quella che NOI forniremo a chi interroga l'endpoint)

*/
author.get("/authors", async (request, response) => {

    try {
        const authors = await authorModel.find().populate("posts");
        const totalAuthor = await authorModel.count();
        response.status(200).send({
            statusCode: 200,
            totalAuthor: totalAuthor,
            authors: authors,
        })
    } catch (error) {
        response.status(500).send({
            statusCode: 500,
            message: "Internal server error",
            error,
        })
    }
});

/* in questa parte stiamo individuando 
il singolo autore attraverso l'id univico generato dalla chiamata precedente, e passando come paramentro al
metodo findById appunto l'id generato  */

author.get("/authors/:authorsId", async (request, response) => {

    const { authorsId } = request.params

    try {
        const authorsById = await authorModel.findById(authorsId);
        response.status(200).send({
            statusCode: 200,
            authorsById,
        })
    } catch (error) {
        response.status(500).send({
            statusCode: 500,
            message: "Internal server error",
            error,
        })
    }
})


/* //in questa parte stiamo definendo la richiesta di tipo 
POST che permette di aggiungere un autore e la struttura dovrà essere quella definita nel nostro model 
file. */

author.post("/authors/create", Avatar.single("avatar"), async (request, response) => {

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(request.body.password, salt);

    const newAuthor = new authorModel({
        nome: request.body.nome,
        cognome: request.body.cognome,
        email: request.body.email,
        password: hashedPassword,
        data: request.body.data,
        avatar: request.file.path,
    });

    try {
        const author = await newAuthor.save();
        response.status(201).send({
            statusCode: 201,
            message: "Author saved successfully",
            payload: author,
        });
    } catch (error) {
        console.error("Error while saving author:", error);
        response.status(500).send({
            statusCode: 500,
            message: "Internal server error",
            error,
        });
    }
});

/* In questa parte del codice definiamo la richiesta di modifica PUT attraverso il metodo patch.(Utilizziamo PATCH INVECE DI PUT 
    perchè nel caso di utilizzo di PUT, se dovessimo passare solo un "nome" ad esempio, il put genererà un nuovo oggetto con il solo dato passato. Mentre patch 
    mantiene il resto dell'oggetto modificando solo il dato passato)
 ricorda che l'id in /authors/:id è un parametro, e pertanto dovrà essere definito come a riga 89.*/

author.patch("/authors/:id", async (request, response) => {
    const id = request.params.id

    //assicuriamoci che l'oggetto esista:
    const authorExist = await authorModel.findById(id)

    try {

        if (!authorExist) {
            return response.status(404).send({
                statusCode: 404,
                message: `Post with ${id} not found`
            })
        }

        //riprendiamo l'id
        const authorId = id;
        //qui specifichiamo che i dati che andrai a scrivere sono quelli che ti passo nel body 
        const dataToUpdate = request.body;

        //questo specifica che quando salveremo i dati, non visualizzeremo l'oggetto precedente, bensi quello appena modificato
        const options = { new: true };

        const result = await authorModel.findByIdAndUpdate(authorId, dataToUpdate, options);
        response.status(200).send({
            statusCode: 404,
            message: `Post with ${id} updated`,
            result,
        })


    } catch (error) {
        response.status(500).send({
            statusCode: 500,
            message: "Internal server error",
            error,
        })
    }
})

author.delete("/authors/id", async (request, response) => {
    const { id } = request.params.id
    const authorExist = await authorModel.findById(id)

    if (!authorExist) {
        return response.status(404).send({
            statusCode: 404,
            message: `Post with ${id} not found`
        })
    }
    try {

        const authotToDelete = await authorModel.findByIdAndDelete(id);

        response.status(200).send({
            statusCode: 200,
            message: `Post with id: ${id} delete successfully`,

        })

    } catch (error) {
        response.status(500).send({
            statusCode: 500,
            message: "Internal server error",
            error,
        })
    }
})



module.exports = author
