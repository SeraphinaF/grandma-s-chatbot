import dotenv from 'dotenv'
import express from 'express';
import cors from "cors";
import axios from 'axios';
import { ChatOpenAI } from "@langchain/openai"

dotenv.config()
const app = express();
app.use(cors());
app.use(express.json());

const model = new ChatOpenAI({
    azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
    azureOpenAIApiVersion: process.env.OPENAIA_API_VERSION,
    azureOpenAIApiInstanceName: process.env.INSTANCE_NAME,
    azureOpenAIApiDeploymentName: process.env.ENGINE_NAME,
});

// Simple GET route for root path
app.get('/', (req, res) => {
    res.send("Welcome to Grandma's Chatbot!");
});

// New route to fetch a random joke
app.get('/joke', async (req, res) => {
    try {
        const response = await axios.get('https://v2.jokeapi.dev/joke/Any?type=single');
        const joke = response.data.joke;

        res.json({ joke });
    } catch (error) {
        console.error('Error fetching joke:', error);
        res.status(500).json({ error: 'An error occurred while fetching the joke' });
    }
});

// Route to handle chat messages
app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const messages = Array.isArray(message) ? message : [message];

        // Fetch a random joke
        const jokeResponse = await axios.get('https://v2.jokeapi.dev/joke/Any?type=single');
        const joke = jokeResponse.data.joke;

        // Define the chat roles as a sweet old lady and include the joke
        const chatRoles = [
            ["system", "Mijn lieve, wat fijn dat je met me praat. Ik ben altijd hier om je te helpen en naar je te luisteren. Laat me weten hoe ik je kan bijstaan."],
            ["human", ...messages],
            ["system", `Oh, trouwens, wil je een grapje horen? Hier is er een voor jou: ${joke}`]
        ];
        
        const answer = await model.invoke(chatRoles);

        res.json({ answer: answer.content });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while processing the message' });
    }
});

const port = process.env.PORT || 3001;

app.listen(port, () => {
    console.log(`Server running on ${port}`);
});
