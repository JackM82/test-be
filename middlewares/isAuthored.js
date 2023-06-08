const isAuthored = (req, res, next) => {
    const {role} = req.body

    if (role !== 'admin') {
        return res.status(400).send({
            message: 'devi essere admin per andare avanti'
        })
    }
    next()
}

export default isAuthored