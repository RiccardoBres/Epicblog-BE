const express = require('express');
const mongoose  = require('mongoose');
const PORT = 9090;

//richiedi cors per collegare backend e frontend
const cors = require('cors');
const app = express();

//fornito da node.js metodo per recuperare la radice della cartella uploads
const path = require('path')

// richiedi libreria che permette di leggere il file ".env"

require('dotenv').config()
app.use(express.json());

//import Cors
app.use(cors());

//richiedi routes
const authorsRoute = require("./Routes/authorsRoute")
const postRoute = require("./Routes/postModelRoute");
const loginRoute = require("./Routes/Login");
const githubRoute = require("./Routes/githubRoute")

//import Routes
app.use("/", authorsRoute)
app.use("/", postRoute)
app.use("/", loginRoute)
app.use("/", githubRoute)


/* //connessione al DATABASE in CLOUD usando mongoose, questa parte non verra MAI inserità come stringa contenente indirizzo e password 
nel nostro codice, essendo un dato sensibile. Pertanto verrà riportato nel file ".nev" e salvato all'interno della variabile MONGO_DB_UR */
mongoose.connect(process.env.MONGO_DB_URL);

//fai in modo che quando il server si apre se c'è stato un errore viene segnalato in console, ed anche quando è aperto la prima volta per capire che il server è connesso
const db = mongoose.connection

//on è una sorta di EventListner che permette di ascoltare l'evento error (primo parametro) e secondo parametro esegue il log dell'err.
db.on("error", console.error.bind("errore connessione al server"));

//ascoltiamo un altro evento che permetterà di confermare se il database è correttamente connesso
db.once("open", ()=> {console.log("database mongodb connesso")});
app.listen(PORT, ()=> console.log(`Server avviato e in ascolto sulla porta ${PORT}`));