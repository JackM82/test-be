import express from 'express'
const router = express.Router()
import PostModel from '../models/post.js'
//validazione del body - usiamo express validator
import {validationResult} from 'express-validator'
import { postsValidation } from '../middlewares/validatePosts.js'
import multer from 'multer'
//import cloudinary from 'cloudinary.v2'
//import {CloudinaryStorage, cloudinaryStorage} from 'multer-storage-cloudinary'

const MaxFileSize = 20000000; 

/////////////// storage file cloud//////////////////////
// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     // api_key: ,
//     // api_secret:
// })

// const cloudStorage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     params: {
//         folder: 'epibookImages',
//         format: async (req, file) => 'png',
//         public_id: (req, file) => file.name
//     }
// })

// router.post('/posts/uploadImg', cloudUpload.single('img'), async(req,res)=>{
//     try {
//         res.status(200).json({img:req.file.path})
//     } catch (error) {
//         console.error('File upload failed',error)
//         res.status(500).send({
//             statusCode:500,
//             message: 'File upload error'
//         })
//     }
// })

// /////////////// storage file locale//////////////////////
// //salvataggio su server su cartella "uploads" che DEVE già esistere
const internalStorage = multer.diskStorage({
    destination: (req, file, cb) => { //cb è la callback con primo parametro a null
        cb(null, 'uploads')//lanciamo la callback con primo argomento "null" come da documentazione
    },
    filename: (req, file, cb) => {
        console.log(file)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random()* 1E9)//suffisso univoco per nome file non sovrascrivibile
        const fileExt = file.originalname.split('.').pop()//estrapoliamo l'estensione file
        cb(null,`${file.fieldname}-${uniqueSuffix}.${fileExt}`)//nomefile-stringaunivoca.estensione
    }
})

//multer di internalStorage
const internalUpload = multer({
    storage: internalStorage,
    limits: {fileSize: MaxFileSize}
})

//rotta con parametro di "single" = stringa con il nome che avremo a frontend
//"img" è il nome dell'input che abbiamo a frontend per esempio <input type="file" name="img">
//internalUpload è il middleware della POST
router.post('/posts/uploadImg', internalUpload.single('img'), async(req,res)=>{
    //dobbiamo recuperare la stringa dell'url del file
    //metodo "protocol" di res = HTTP o HTTPS , poi gli concateniamo ""://" + host (indirizzo server) 
    const url = req.protocol + '://' + req.get('host')
    try {
        const imgUrl = req.file.filename
        res.status(200).json({
            img:`${url}/uploads/${imgUrl}` 
        })
    } catch (error) {
        console.error('File upload failed',error)
        res.status(500).send({
            statusCode:500,
            message: 'File upload error'
        })
    }
})


/////////////////////   crud   //////////////////////
//GET
router.get('/posts', async(req,res)=>{
    const {page=1, pageSize=8}=req.query //impostiamo query paginazione
    try {
        const posts = await PostModel.find()
        .limit(pageSize)
        .skip((page-1)*pageSize)//offset post da saltare

        const totalPosts = await PostModel.count()

        res.status(200).send({
            message: 'operazione eseguita correttamente',
            statusCode: 200,
            count:totalPosts,
            currentPage: +page, //il "+" casta a numero la variabile "page"
            totalPages: Math.ceil(totalPosts/pageSize),
            posts
        })

    } catch (error) {
        res.status(500)
        .send({
            statusCode:500,
            message: 'Errore interno del server'
        })
    }
})

//GET post per titolo
router.get('/posts/bytitle/:title', async(req,res)=>{
    try {
        const {title} = req.params //destrutturiamo e recuperiamo il title
        //regular expression
        const postByTitle = await PostModel.find({
            title:{ //cerchiamo nel title con vari operatori
                $regex: '.*' + title + '.*', //regex
                $options: 'i'   //option 'i' insensitive (non distingue maiscole, minuscole)
            }
        })
        if (!postByTitle || postByTitle.length === 0){
            return res.status(404)
            .send({
                statusCode:404,
                message:"no posts found with this title"
            })
        }
        res.status(200)
        .send({
            statusCode:200,
            message:"post found",
            postByTitle
        })

    } catch (error) {
        console.log(error)
        res.status(500)
        .send({
            statusCode:500,
            message:'server internal error'
        })
    }
})

//GET singolo post
router.get('/posts/:id', async(req,res)=>{
    const {id} = req.params
    try {
        const post = await PostModel.findOne({_id:id}) //recupera prima occorrenza
        
        if (!post){
            return res.status(404)
            .send({
                message: `post by id ${id} not found`,
                statusCode: 404
            })
        }
        res.status(200).send({
            message: 'operazione eseguita correttamente',
            statusCode: 200, 
            post
        })
    } catch (error) {
        res.status(500)
        .send({
            statusCode:500,
            message: 'Errore interno del server'
        })
    }
})

//POST
router.post('/posts',postsValidation ,async(req,res)=>{   
    const errors = validationResult(req)
    if (!errors.isEmpty()){ //se abbiamo erroi (non è vuoto l'array di errors)
        return res.status(400)
        .send({
            errors: errors.array(), //funzioni di error validator
            statusCode:400
        })
    }

    const post = new PostModel({ //istanza dello Schema
        title: req.body.title,
        category: req.body.category,
        content: req.body.content,
        author: req.body.author,
        readTime: req.body.readTime,
        rate: req.body.rate,
        img: req.body.img
    })
    try {
        const postExist = await PostModel.findOne({title: req.body.title})
        if (postExist){ //controllo se già esistente 
            return res.status(409).send({
                message:"post with same title already exists",
                statusCode: 409
            })
        }
        const newPost = await post.save() //salvataggio nel DB
        res.status(201).send({ //stato created
            statusCode:201,
            message: 'post saved successfully',
            newPost
        })
    } catch (error) {
        console.log(error)
        res.status(500)
        .send({
            statusCode:500,
            message:'internal server error'
        })
    }
})

//PATCH
router.patch('/posts/:id', async (req,res)=>{
    const {id} = req.params
    const postExist = await PostModel.findById(id)
    if(!postExist){
        return res.status(404)
        .send({
            statusCode:404,
            message: 'Post not found'
        })
    }
    try {
        const dataUpdated = req.body
        const options = {new:true}
        const result = await PostModel.findByIdAndUpdate(id, dataUpdated, options)
        res.status(200).send({
            statusCode: 200,
            message:'post modified ok',
            payload: result
        })

    } catch (error) {
        console.log(error)
        res.status(500)
        .send({
            statusCode:500,
            message:'server internal error'
        })
    }
})

//DELETE
router.delete("/posts/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const postExist = await PostModel.findByIdAndDelete(id);
    if (!postExist) {
      return res.status(404).send({
        statusCode: 404,
        message: "Post not found",
      });
    }
    res.status(200)
    .send({
        statusCode:200,
        message:`post con id=${id} rimosso dal DB`
    })
  } catch (error) {
    console.log(error);
    res.status(500).send({
      statusCode: 500,
      message: "server internal error",
    });
  }
});


export default router