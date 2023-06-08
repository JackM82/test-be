import express from 'express'
import UsersModel from '../models/users.js'
const router = express.Router()
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

//POST
router.post('/login', async(req,res)=>{
    const user = await UsersModel.findOne({
        email: req.body.email
    })
    if (!user){
        return res.status(404).send({
            message:'email o pw non valida',
            statusCode: 404,
        })
    }
    const validPassword = await bcrypt.compare(req.body.password, user.password) //parametri: password del login, password trovata su DB
    if (!validPassword){
        return res.status(400).send({ //bad request
            message: 'pw non valida',
            statusCode: 400
        })
    }

    //token per il frontend generato su email univoca dell'utente e sarà valido 24h
    const token = jwt.sign({//1°parametro
        email: user.email,//almeno un parametro univoco
        userName: user.userName,
        role: user.role
    }, 
    process.env.SECRET_JWT_KEY, //2°parametro - set di caratteri per generare l' hash
    { //3° parametro 
        expiresIn: '24h' //validità 24h
    })
    
    //ci facciamo arrivare nell'header l'autorizzazione con il token
    res.header('auth', token).status(200).send({
        token,
        statusCode:200,
        message: 'Login effettuato con successo'
    })
})

export default router