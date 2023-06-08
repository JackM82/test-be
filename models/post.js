import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    content:{
        type: String,
        required: true
    },  
    author:{
        name:{
            type: String,
            required: true,
            default: 'name default'
        },
        avatar:{
            type: String,
            required: false,
            default: 'https://picsum.photos/200/200'
        }
    },
    rate:{
        type: Number,
        required: false,
        max: 5,
        min: 0,
        default: 0
    },
    img:{
        type: String,
        required: false,
        default: 'https://picsum.photos/1920/1080'
    },
    category: {
        type: String,
        required: false
    },
    readTime: {
        value:{
            type: Number,
            require: false,
            default: 0
        },
        unit:{
            type: String,
            require: false,
            default: 'min'
        }
    }

},{timestamps:true , strict:true})
                            //nome schema,  //schema    ,//tabella nel DB (collection)
const PostModel = mongoose.model('postModel', PostSchema, 'posts')

export default PostModel