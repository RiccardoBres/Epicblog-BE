const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const AuthorModel = require('../Models/authorModel');
const jwt = require('jsonwebtoken');

router.post('/login', async(req,res)=>{
    const user = await AuthorModel.findOne({email: req.body.email});
    if(!user){
        return res.status(404).send({
            statusCode: 404,
            message: "User not found",
        })
    }

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword){
        return res.status(400).send({
            statusCode: 400,
            message: "Password non valida"
        })
    }

    const token = jwt.sign({
        id: user._id,
        name: user.nome,
        surname: user.cognome,
        email: user.email,
        data: user.data,
        avatar: user.avatar
    }, 
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
    );

   res.header('Authorization', token).status(200).send({
    statusCode: 200,
    token,
   });
})


module.exports = router;
