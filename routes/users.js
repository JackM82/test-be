import express from 'express'
import UsersModel from '../models/users.js'
const router = express.Router()
import bcrypt from 'bcrypt'
import logger from '../middlewares/logger.js'
import cacheMiddleware from '../middlewares/cacheMiddleware.js'

//GET
router.get('/users',[cacheMiddleware, logger], async(req,res)=>{ // [cacheMiddleware, logger] ,
    const {page=1, pageSize=8}=req.query
    try {
        const users = await UsersModel.find()
        .limit(pageSize)
        .skip((page-1)*pageSize)

        const totalUsers = await UsersModel.count()

        res.status(200).send({
            count:totalUsers,
            currentPage: +page,//Number(page)  il "+" fa il cast rapido a numero come Number()
            totalPages: Math.ceil(totalUsers/pageSize),
            users
        })
    } catch (error) {
        res.status(500)
        .send({
            message: 'Errore interno del server'
        })
    }
})

//POST
router.post('/users', async(req,res)=>{
    //ash pw
    const genSalt = await bcrypt.genSalt(10) //generazione complessità algoritmo
    const hashPW = await bcrypt.hash(req.body.password,genSalt)

    const user = new UsersModel({
        userName: req.body.userName,
        email: req.body.email,
        password: hashPW
    })
    try {
        const userExist = await UsersModel.findOne({email:req.body.email})
        if (userExist){
            return res.status(409)
            .send({
                message:'email già esistente'
            })
        }
        const newUser = await user.save();
        res.status(201).send({
            message: 'user registered',
            payload: newUser
        })
    } catch (error) {
        console.log(error)
        res.status(500)
        .send({
            message:'errore interno del server'
        })
    }
})

//PATCH
router.patch('/users/:id', async(req,res)=>{
    const {id} = req.params;
    const userExist = await UsersModel.findById(id)
    if (!userExist){
        return res.status(404).send({
            message: 'utente inesistente'
        })
    }
    try {
        const userID = id;
        const dataUpdated = req.body;
        const options = {new: true}
        const result = await UsersModel.findByIdAndUpdate(userID, dataUpdated, options)
        res.status(200).send({
            message: 'User modified',
            payload: result
        })
    } catch (error) {
        res.status(500)
        .send({
            message: 'Errore interno del server'
        })
    }
})


export default router

