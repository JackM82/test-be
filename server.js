import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import usersRoute from  './routes/users.js'
import loginRoute from  './routes/login.js'
import postsRoute from './routes/posts.js'
import path from 'path'
import { fileURLToPath } from 'url';

dotenv.config()
const PORT = 5050;
const app = express();

//static file middleware per salvare i file usando libreria PATH
const __filename = fileURLToPath(import.meta.url);//metodo per usare "__dirname" con package.json' contains "type": "module"
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, './uploads')))

//middleware globali chiamati per tutte le rotte
app.use(express.json());
app.use(cors());//abilita il server a ricevere richieste da qualsiasi origine

//rotte
app.use('/', usersRoute)
app.use('/', loginRoute)
app.use('/', postsRoute)

mongoose.connect(process.env.DB_URL,{ //process.env.DB_URL è la protezione dei dati sensibili mediante il file "env"
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Errore di connessione al DB'))
db.once('open', ()=>{console.log('DB connesso correttamente')})

app.listen(PORT, ()=>console.log(`Server avviato sulla porta ${PORT}`))

