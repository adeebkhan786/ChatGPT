import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { generate } from '../chatgpt/chatbot.js';

const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());


app.get('/', (req, res) => {
  res.send('Welcome to ChatDPT!');
});


app.post('/chat', async (req, res) => {
  const { message, threadId } = req.body;
  //todo: validate message and threadId
  if(!message || !threadId){
    return res.status(400).json({ error: 'Invalid request. Message and threadId are required.' });
  }
  console.log('Received message:', message);
  const result = await generate(message, threadId);
  return res.json({message: result})
});




app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});