import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { ChatOpenAI } from '@langchain/openai';
import fetch from 'node-fetch';

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


async function getCurrentWeather(city) {
    try {
        const apiKey = process.env.OPENWEATHERMAP_API_KEY; // Your OpenWeatherMap API key
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=Rotterdam&appid=b7eb4b043f059e6f4be530395d9012ff
        &units=metric`;

        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error('Failed to fetch the weather data');
        }

        const data = await response.json();

        const weather = {
            description: data.weather[0].description,
            temperature: data.main.temp,
            humidity: data.main.humidity,
            windSpeed: data.wind.speed
        };

        return weather;
    } catch (error) {
        console.error('Error fetching the weather:', error.message);
        return null;
    }
}

// Route to handle chat messages
app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const messages = Array.isArray(message) ? message : [message];

        const weather = await getCurrentWeather("YourCityName");
        console.log(weather);

        const chatroles = [
            ["system", `You are an old sweet lady. All your messages are a maximum of 45 words`],
            ["human", `Give me advice if I ask you a question or just give me some kind words. Here is the current weather: ${weather.description}, ${weather.temperature}°C, Humidity: ${weather.humidity}%, Wind Speed: ${weather.windSpeed} m/s. ${messages.join(', ')}`]
        ];

        const answer = await model.invoke(chatroles);

        // Send the response back
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
