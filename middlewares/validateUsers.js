const validateUser = (req, res, next) => {
    const errors = []

    const { firstName, lastName, email, password, age } = req.body

    if (typeof firstName !== 'string') {
        errors.push('FirstName must be a valid string')
    }

    if (typeof lastName !== 'string') {
        errors.push('LastName must be a valid string')
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Please provide a valid email address')
    }

    if (typeof password !== 'string' || password.length < 8) {
        errors.push('Password must be a string or at least with 8 characters')
    }

    if (typeof age !== 'number') {
        errors.push('Age must be a valid number, not a string')
    }

    if (errors.length > 0) {
        res.status(400).send({ errors })
    } else {
        next()
    }
}


module.exports = validateUser