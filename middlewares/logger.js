const logger = (req, res, next) => { //il middleware ha tre parametri
    const { url, ip, method} = req
    console.log(`${new Date().toISOString()} Effettuata richiesta ${method} all'enpoint ${url} da ip ${ip}`)

    next()
}

export default logger

