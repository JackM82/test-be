import {body} from 'express-validator'

export const postsValidation = [ //array dei middleware
//funzione  //gestione errore
body('category').notEmpty().isString().withMessage('category cannot be empty and must be a string'),
body('content').notEmpty().isString().withMessage('content cannot be empty and must be a string'),
body('title').notEmpty().isString().withMessage('title cannot be empty and must be a string'),
body('author.name').notEmpty().isString().withMessage('author name cannot be empty and must be a string'),
body('author.avatar').notEmpty().isURL().withMessage('author avatar cannot be empty and must be a valid URL'),
//body('cover')
]