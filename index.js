const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
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
    const addArtwork = client.db('addArtwork')
    const addArtworkCollection = addArtwork.collection('addArtwork')

    app.post("/addArtwork",(req,res)=>{
        const newUser = req.body;
        const result = addArtworkCollection.insertOne(newUser);
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