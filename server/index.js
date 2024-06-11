import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { ChatOpenAI } from '@langchain/openai';

dotenv.config();

const app = express();
app.use(cors());

const model = new ChatOpenAI({
    azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
    azureOpenAIApiVersion: process.env.OPENAI_API_VERSION,
    azureOpenAIApiInstanceName: process.env.INSTANCE_NAME,
    azureOpenAIApiDeploymentName: process.env.ENGINE_NAME,
});

app.use(express.json());

// Function to fetch weather information
async function getWeather(city) {
    const apiKey = process.env.OPENWEATHER_API_KEY; // Ensure this key is in your .env file
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;
    }
}

// Route to retrieve a joke
app.get('/', async (req, res) => {
    try {
        const joke = await model.invoke("Is snow cold?");
        res.json({ joke });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while fetching the joke' });
    }
});

// Route to handle chat messages
app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const messages = Array.isArray(message) ? message : [message];

        const chatroles = [
            ["system", "Je bent een lief oud vrouwtje dat altijd een advies en een glimlach paraat heeft. al je berichten zijn max 45 woorden"],
            ["human", `Stel me gerust, geef me advies of hype me op of zeg simpelweg dat je trots op me bent ${messages.join(', ')}`]
        ];

        const answer = await model.invoke(chatroles);

        res.json({ answer: answer.content });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while processing the message' });
    }
});

// New route to chat about weather
app.get('/weather', async (req, res) => {
    try {
        const city = req.query.city || 'Amsterdam'; // Default city if none is provided
        const weatherData = await getWeather(city);

        if (weatherData) {
            const weatherDescription = weatherData.weather[0].description;
            const temperature = weatherData.main.temp;
            const weatherMessage = `Het is momenteel ${temperature}°C en ${weatherDescription} in ${city}.`;

            const chatroles = [
                ["system", "Je bent een lief oud vrouwtje dat altijd een advies en een glimlach paraat heeft. al je berichten zijn max 45 woorden"],
                ["human", `Oma, hoe is het weer? Hier in ${city} is het ${weatherDescription} en ${temperature} graden.`]
            ];

            const answer = await model.invoke(chatroles);

            res.json({ weatherMessage, answer: answer.content });
        } else {
            res.status(500).json({ error: 'Unable to fetch weather data' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while fetching the weather' });
    }
});

const port = process.env.PORT || 3001;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
