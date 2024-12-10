import express, { Request, Response } from 'express';
import { MongoClient, ReturnDocument } from 'mongodb';
import cors from 'cors';
const app = express()
const port = 5000

const uri = "mongodb://Admin:12345@localhost:27017";

app.use(cors());
app.use(express.json());

type CounterDocument = {
  _id: string; // Counter identifier
  sequence_value: number;
}

// Create task
app.post('/tasks/create', async(req: Request, res: Response) => {
    const task = req.body;
    const client = new MongoClient(uri);
    await client.connect();

    const count= await client.db('mytasks').collection('tasks').countDocuments({})

    const sequenceDoc = await client.db('mytasks').collection<CounterDocument>('counters').findOneAndUpdate(
      { _id: "taskId" }, // Counter identifier
      { $set: {sequence_value: count+1} }, // Increment the counter
      { upsert: true, returnDocument: ReturnDocument.AFTER } // Create the counter document if it doesn't exist
    );

    const newId = sequenceDoc.value?.sequence_value || 1;
    await client.db('mytasks').collection('tasks').insertOne({
      id: newId, 
      title: task.title,
      description: task.description,
      created_at: task.create_at || new Date().toUTCString().slice(0, 16),
      is_completed: task.is_completed || false       
    });
    await client.close();
    res.status(200).send({
      "status": "ok",
      "message": "Task with ID = "+task.id+" is created",
      "task": task
    });
})

// Read all data in collection tasks
app.get('/tasks', async(req: Request, res: Response) => {     
    const client = new MongoClient(uri);
    await client.connect();
    const tasks = await client.db('mytasks').collection('tasks').find({}).toArray();
    await client.close();
    res.status(200).send(tasks);
})

// Update task
app.put('/tasks/update', async(req: Request, res: Response) => {
    const task = req.body;
    const id = parseInt(task.id);
    const client = new MongoClient(uri);
    await client.connect();
    await client.db('mytasks').collection('tasks').updateOne({'id': id}, {"$set": {       
      title: task.title,
      description: task.description        
    }});
    await client.close();
    res.status(200).send({
      "status": "ok",
      "message": "User with ID = "+id+" is updated",
      "task": task
    });
  })

// Delete task  
app.delete('/tasks/delete', async(req: Request, res: Response) => {
    const id = parseInt(req.body.id);
    const client = new MongoClient(uri);
    await client.connect();
    await client.db('mytasks').collection('tasks').deleteOne({'id': id});   
    await client.close();
    res.status(200).send({
      "status": "ok",
      "message": "User with ID = "+id+" is deleted"
    });
  })

// Update id after delete task
app.put('/tasks/updateid', async(req: Request, res: Response) => {
  const task = req.body;
  const id = parseInt(task.id);
  const client = new MongoClient(uri);
  await client.connect();
  const count= await client.db('mytasks').collection('tasks').countDocuments({});
  //Update counter
  await client.db('mytasks').collection<CounterDocument>('counters').findOneAndUpdate(
    { _id: "taskId" },  
    { $set: {sequence_value: count+1} },  
    { returnDocument: ReturnDocument.AFTER }  
  );   
  //-1 all document id below deleted task 
    for (let i=id;i<=count;i++){
      await client.db('mytasks').collection('tasks').updateOne({'id': i+1}, {"$set": {       
            id:i
      }});
    }
  await client.close();
  res.status(200).send({
    "status": "ok",
    "message": "User with ID = "+id+" is updated",
    "task": task
  });
})  

// Done task
app.put('/tasks/done', async(req: Request, res: Response) => {
  const task = req.body;
  const id = parseInt(task.id);
  const client = new MongoClient(uri);
  await client.connect();
  await client.db('mytasks').collection('tasks').updateOne({'id': id}, {"$set": {     
    is_completed: true
  }});
  await client.close();
  res.status(200).send({
    "status": "ok",
    "message": "User with ID = "+id+" is done",
    "task": task
  });
})

// Undone task
app.put('/tasks/undone', async(req: Request, res: Response) => {
  const task = req.body;
  const id = parseInt(task.id);
  const client = new MongoClient(uri);
  await client.connect();
  await client.db('mytasks').collection('tasks').updateOne({'id': id}, {"$set": {     
    is_completed: false
  }});
  await client.close();
  res.status(200).send({
    "status": "ok",
    "message": "User with ID = "+id+" is undone",
    "task": task
  });
})

//Port  
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})