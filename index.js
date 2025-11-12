const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.port || 3000

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster01.aptihsx.mongodb.net/?appName=Cluster01`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
  
    await client.connect();
    const addArtwork = client.db('serverDB')
    const addArtworkCollection = addArtwork.collection('addArtwork')
    const addLikesCollection = addArtwork.collection('likes')
    const addFavoritesCollection = addArtwork.collection('favoriteArt')

    app.post("/addArtwork",async (req,res)=>{
        const newUser = req.body;
        const result = await addArtworkCollection.insertOne(newUser);
        res.send(result)
    })
    app.get("/addArtwork", async (req, res)=>{
        const cursor = addArtworkCollection.find();
        const result = await cursor.toArray();
        res.send(result)

    })

    app.get('/addArtwork/:id', async (req,res) => {
        const id = req.params.id
        const query = { _id: new ObjectId(id)};
        const result = await addArtworkCollection.findOne(query);
        res.send(result)
    })

    app.get('/latest-addArtwork', async (req ,res)=>{
        const result = await addArtworkCollection.find().sort({createdAt: 'desc'}).limit(6).toArray();

        res.send(result)
    })
    
    
    

    app.post("/likes/:id", async (req, res)=>{
        const data = req.body;
        const id = req.params.id;
        const result = await addLikesCollection.insertOne(data)
        const filter = { _id: new ObjectId(id)}
        const update = {
            $inc: {
                likes: 1
            }
        }
        
        const likesCount = await addArtworkCollection.updateOne(filter,update)
        res.send({result,likesCount})
    })

    app.post('/favoriteArt', async (req,res) => {
        const data = req.body;
        
    const result = await addFavoritesCollection.insertOne(data)
        res.send(result)
    })

    app.get('/my-favoriteArt', async (req, res) => {
        const email = req.query.email
        const result = await addFavoritesCollection.find({favorite_by: email, }).toArray()
        res.send(result)

    })
    app.get('/favoriteArt/:id', async (req ,res) =>{
        const id = req.params.id
        const query = {_id: id}
        const result = await addFavoritesCollection.findOne(query);
        res.send(result)
    })

    app.delete('/favoriteArt/:id', async (req, res) =>{
        
        const id = req.params.id
        const filter = ({ _id: id})
        const result = await addFavoritesCollection.deleteOne(filter);
        res.send(result)
    })

    app.get('/my-gallery', async (req, res) =>{
        const email = req.query.email
        const result = await addArtworkCollection.find({email: email}).toArray()
        res.send(result)
    })

    app.put('/addArtwork/:id', async (req,res) =>{
        const id = req.params.id;
        const data = req.body;
        const filter = { _id: new ObjectId(id)}
        const update = {
            $set: data
        }
        const result = await addArtworkCollection.updateOne(filter , update)
        res.send(result)
    })

    app.delete('/addArtwork/:id', async (req, res) =>{
        const id = req.params.id;
        const filter = { _id: new ObjectId(id)};
        const result = await addArtworkCollection.deleteOne(filter);
        res.send(result)
    })
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
  }
}
run().catch(console.dir);

app.get('/', (req,res)=>{
    res.send('server is running now!')
})
app.listen(port,()=>{
    console.log(`Example app listening on port ${port}`);
})