const mongoose = require("mongoose")

const authorModel = new mongoose.Schema({
nome: {
    type : String,
    required: true
} ,
cognome: {
    type : String,
    require : true
}, 
password: {
    type : String,
    required: false
},
email: {
    type : String,
    required: false,
    unique : true
} ,
data: {
    type : String,
},
avatar: {
    type : String,
    require : true
},
posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Posts",
    default: [],
}]
    


//lo strict vuol dire che non verrà emessa nessuna proprietà aggiuntiva, il timestrap registra la data di upload
},{timestamps :true, strict :true});


/* 
Esportiamo il codice, mongoose.model() prende tre paramentri:
1:Nome parlante del modello,secondo: post model schema,
2: variabile con mongoose.Schema
3: altra stringa con il nome della tabella in cui salveremo il modello in mongoDB. Immagina l'etichetta di un cassetto */
module.exports = mongoose.model("Author", authorModel, "Authors");