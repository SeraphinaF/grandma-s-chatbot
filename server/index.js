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
    azureOpenAIApiKey: process.env.AZURE_OPENAIA_API_KEY,
    azureOpenAIApiVersion: process.env.OPENAIA_API_VERSION,
    azureOpenAIApiInstanceName: process.env.INSTANCE_NAME,
    azureOpenAIApiDeploymentName: process.env.ENGINE_NAME,
});

// Simple GET route for root path
app.get('/', (req, res) => {
    res.send("Welcome to Grandma's Chatbot!");
});

// Route to handle chat messages
app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const messages = Array.isArray(message) ? message : [message];

        // Define the chat roles as a sweet old lady
        const chatRoles = [
            ["system", "Mijn lieve, wat fijn dat je met me praat. Ik ben altijd hier om je te helpen en naar je te luisteren. Laat me weten hoe ik je kan bijstaan."],
            ["human", ...messages] 
        ];
        
        const answer = await model.invoke(chatRoles);

        res.json({ answer: answer.content });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while processing the message' });
    }
});

// New route to get weather information
app.get('/weather', async (req, res) => {
    const city = req.query.city;
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;

    if (!city) {
        return res.status(400).json({ error: 'City name is required' });
    }

    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
            params: {
                q: city,
                appid: apiKey,
                units: 'metric'
            }
        });

        const weatherData = response.data;
        res.json({
            city: weatherData.name,
            temperature: weatherData.main.temp,
            description: weatherData.weather[0].description
        });
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).json({ error: 'An error occurred while fetching the weather data' });
    }
});

const port = process.env.PORT || 3001;

app.listen(port, () => {
    console.log(`Server running on ${port}`);
});
