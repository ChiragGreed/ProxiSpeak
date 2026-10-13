import { body, validationResult } from 'express-validator';

const validationHandler = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    next();
}


export const registerValidator = [
    body("fullName")
        .isLength({ min: 3 })
        .withMessage("fullName must be at least 3 characters long"),

    body("email")
        .isEmail()
        .withMessage("Please provide a valid email address"),

    body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long")
        .matches(/\d/)
        .withMessage("Password must contain a number"),

    validationHandler

]

export const loginValidator = [
    body("email")
        .isEmail()
        .withMessage("Please provide a valid email address"),

    body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long")
        .matches(/\d/)
        .withMessage("Password must contain a number"),


    validationHandler
]