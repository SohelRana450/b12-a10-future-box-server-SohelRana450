const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const admin = require("firebase-admin");
const serviceAccount = require("./project.json");

const app = express()
const port = process.env.port || 3000

app.use(cors());
app.use(express.json());


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const verifyToken = async (req, res, next) =>{
    const authorization = req.headers.authorization
    if(!authorization){
        res.status(401).send({
            message: "unauthorization access."
        })
    }
    const token = authorization.split(' ')[1]

    try {
        await admin.auth().verifyIdToken(token) 
        next()
    } catch (error) {
        res.status(401).send({
            message: "unauthorization access."
        })
    }
   
}

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
  
    const addArtwork = client.db('serverDB')
    const addArtworkCollection = addArtwork.collection('addArtwork')
    const addLikesCollection = addArtwork.collection('likes')
    const addFavoritesCollection = addArtwork.collection('favoriteArt')

    app.post("/addArtwork",verifyToken,async (req,res)=>{
        const newUser = req.body;
        const result = await addArtworkCollection.insertOne(newUser);
        res.send(result)
    })
    app.get("/addArtwork", verifyToken, async (req, res)=>{
        const cursor = await addArtworkCollection.find().toArray();
        res.send(cursor)

    })

    app.get('/addArtwork/:id', verifyToken, async (req,res) => {
        const id = req.params.id
        const query = { _id: new ObjectId(id)};
        const result = await addArtworkCollection.findOne(query);
        res.send(result)
    })

    app.get('/latest-addArtwork',verifyToken, async (req ,res)=>{
        const result = await addArtworkCollection.find().sort({createdAt: 'desc'}).limit(6).toArray();

        res.send(result)
    })
    
    
app.post("/likes/:id", verifyToken, async (req, res) => {
  const { userEmail } = req.body; 
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
    const artwork = await addArtworkCollection.findOne(filter);
    if (!artwork){
         return res.status(404).send({ message: "Artwork not found" });
    }
    let update;
    if (artwork.likedBy?.includes(userEmail)) {
      
      update = { $inc: { likes: -1 }, $pull: { likedBy: userEmail } };
    }
     else {
      update = { $inc: { likes: 1 }, $push: { likedBy: userEmail } };
    }

    const result = await addArtworkCollection.updateOne(filter, update);
    const updatedArtwork = await addArtworkCollection.findOne(filter);

    res.send({result, 
        success: true, likes: updatedArtwork.likes });
  
});


    app.post('/favoriteArt', verifyToken, async (req,res) => {
        const data = req.body;
    const result = await addFavoritesCollection.insertOne(data)
        res.send(result)
    })

    app.get('/my-favoriteArt',verifyToken, async (req, res) => {
        const email = req.query.email
        const result = await addFavoritesCollection.find({favorite_by: email, }).toArray()
        res.send(result)

    })
    app.get('/favoriteArt/:id',verifyToken, async (req ,res) =>{
        const id = req.params.id
        const query = {_id: id}
        const result = await addFavoritesCollection.findOne(query);
        res.send(result)
    })

    app.delete('/favoriteArt/:id', verifyToken, async (req, res) =>{
        
        const id = req.params.id
        const filter = ({ _id: id})
        const result = await addFavoritesCollection.deleteOne(filter);
        res.send(result)
    })

    app.get('/my-gallery',verifyToken, async (req, res) =>{
        const email = req.query.email
        const result = await addArtworkCollection.find({email: email}).toArray()
        res.send(result)
    })

    app.put('/addArtwork/:id',verifyToken, async (req,res) =>{
        const id = req.params.id;
        const data = req.body;
        const filter = { _id: new ObjectId(id)}
        const update = {
            $set: data
        }
        const result = await addArtworkCollection.updateOne(filter , update)
        res.send(result)
    })

    app.delete('/addArtwork/:id', verifyToken, async (req, res) =>{
        const id = req.params.id;
        const filter = { _id: new ObjectId(id)};
        const result = await addArtworkCollection.deleteOne(filter);
        res.send(result)
    })

    app.get('/search', verifyToken, async (req,res) =>{
        const search = req.query.search 
        const result = await addArtworkCollection.find({ title: {$regex: search, $options: "i"}}).toArray()
        res.send(result)
    })
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