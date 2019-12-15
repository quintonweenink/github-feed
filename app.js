const CONNECTION_URL = process.env.CONNECTION_URL
const DATABASE_NAME = process.env.DATABASE_NAME
const PORT = process.env.PORT || 8080;

const Express = require("express")
const cors = require("cors")
const BodyParser = require("body-parser")
const MongoClient = require("mongodb").MongoClient
const ObjectId = require("mongodb").ObjectID

var app = Express()
app.use(BodyParser.json())
app.use(BodyParser.urlencoded({ extended: true }))
app.use(cors())
var database, collection

app.listen(PORT, () => {
    MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
        if (error) {
            throw error
        }
        database = client.db(DATABASE_NAME)
        collection = database.collection("read_later")
        console.log("Connected to `" + DATABASE_NAME + "`!")
    })
})

app.put("/read-later/:username", (request, response) => {
    const username = request.params.username
    const items = request.body

    collection.findOne({ username: username }, (error, result) => {
        if (error) {
            return response.status(500).send(error)
        }
        if (!result) {
            var insertData = { username: username, items: items }

            collection.insertOne(insertData, (error, result) => {
                if (error) {
                    return response.status(500).send(error)
                }
                response.send(result.result)
            })
        } else {
            var updateItemsQuery = { $push: { items: { $each: items } } }

            collection.updateOne({ username: username }, updateItemsQuery, (error, result) => {
                if (error) {
                    return response.status(500).send(error)
                }
                response.send(result.result)
            })
        }
    })
})

app.delete("/read-later/:username", (request, response) => {
    const username = request.params.username
    const items = request.body
    const updateItemsQuery = { $pull: { items: { $in: items } } }

    collection.updateOne({ username: username }, updateItemsQuery, (error, result) => {
        if (error) {
            return response.status(500).send(error)
        }
        response.send(result.result)
    })
})

app.get("/read-later/:username", (request, response) => {
    const username = request.params.username

    collection.findOne({ username: username }, (error, result) => {
        if (error) {
            return response.status(500).send(error)
        }
        response.send(result)
    })
})

app.get("/read-later", (request, response) => {
    collection.find({}).toArray((error, result) => {
        if (error) {
            return response.status(500).send(error)
        }
        response.send(result)
    })
})