//salva tutti i dati già richiesti in un oggetto e li inserisce in cache
const cache = new Map()

const cacheMiddleware = (req, res, next) => {
    const { url } = req

    const cachedResponse = cache.get(url)

    if (cachedResponse){
        return res.send(JSON.parse(cachedResponse))
    }

    res.sendResponse = res.send
    res.send = (body) => {
        cache.set(url, body)
        res.sendResponse(body)
    }
    next()
}

export default cacheMiddleware



