const express = require("express");
const cors = require("cors")
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId
require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000


// middleware 
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dki2q.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



app.get('/', (req, res) => {
    res.send("hello")
})

async function run() {
    try {
        await client.connect()
        const database = client.db("bike-heavenDB");
        const productCollection = database.collection("products");
        const reviewCollection = database.collection("reviews");
        const userCollection = database.collection("users");
        const orderCollection = database.collection("orders");

        // PRODUCT POST API
        app.post('/products', async (req, res) => {
            const result = await productCollection.insertOne(req.body)
            res.send(result)
        })

        // GET Product API
        app.get("/products", async (req, res) => {
            const query = await productCollection.find({});
            const result = await query.toArray()
            res.send(result)
        })
        // Review POST API
        app.post('/reviews', async (req, res) => {
            const result = await reviewCollection.insertOne(req.body)
            res.send(result)
        })

        // GET Product API
        app.get("/reviews", async (req, res) => {
            const query = await reviewCollection.find({});
            const result = await query.toArray()
            res.send(result)
        })

        // User POST
        app.post('/users', async (req, res) => {
            const result = await userCollection.insertOne(req.body)
            res.send(result)
        })

        // Admin API
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        // User UPSERT API
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: { user } }
            const result = await userCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        })

        app.put('/useradmin', async(req, res)=> {
            console.log("hit",req.body)
            const user = req.body
            const filter = await {email: user?.email}
            console.log(filter)
            const updateDoc = {$set:{role:"admin"}}
            const result = await userCollection.updateOne(filter, updateDoc)
            res.send(result)
        })



        // Single Product API
        app.get('/details/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await productCollection.findOne(query)
            res.send(result)
        })

        // ORDER API
        app.post("/orders", async (req, res) => {
            const result = await orderCollection.insertOne(req.body)
            res.send(result)
        })

        // order get api
        app.get('/orders', async (req, res) => {
            const result = await orderCollection.find({}).toArray()
            res.send(result)
        })

        //Orders Pending API
        app.get('/orders/:param', async (req, res) => {
            const pending = req.params.param;
            const query = { status: pending }
            const result = await orderCollection.find(query).toArray()
            res.send(result)
        })
        app.get('/myorder/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const result = await orderCollection.find(query).toArray()
            res.send(result)
        })

        // Order API Update 
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const updateInfo = req.body
            const option = { upsert: true }
            const updateDoc = {
                $set: { status: updateInfo.status }
            }
            const result = await orderCollection.updateOne(filter, updateDoc, option)
            res.send(result)
        })

        // delete orders api 
        app.delete("/orders/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await orderCollection.deleteOne(query)
            res.send(result)
        })
        // delete product api 
        app.delete("/products/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            console.log(query);
            const result = await productCollection.deleteOne(query)
            res.send(result)
            console.log(result)
        })
    }
    finally {

    }
}
run().catch()


app.listen(port, () => {
    console.log(port);
})