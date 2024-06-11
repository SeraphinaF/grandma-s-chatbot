import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { ChatOpenAI } from '@langchain/openai';
import fetch from 'node-fetch'; // Ensure node-fetch is installed

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

// Combined Chat and Quote Route
app.post('/chat', async (req, res) => {
    try {
        const { message, includeQuote } = req.body;
        let chatMessage = message;

        // If includeQuote is true, fetch a quote
        if (includeQuote) {
            const quoteResponse = await fetch('https://quotes.rest/qod?language=en', {
                headers: {
                    'Content-Type': 'application/json',
                    'X-TheySaidSo-Api-Secret': process.env.QUOTES_API_KEY // Add your Quotes API key if needed
                }
            });

            if (!quoteResponse.ok) {
                throw new Error('Failed to fetch the quote');
            }

            const quoteData = await quoteResponse.json();
            const quote = quoteData.contents.quotes[0].quote;

            // Include the quote in the chat message
            chatMessage += ` Here is a quote for you: "${quote}"`;
        }

        const chatroles = [
            ["system", "Je bent een lief oud vrouwtje dat altijd een advies en een glimlach paraat heeft. al je berichten zijn max 45 woorden"],
            ["human", chatMessage]
        ];

        const answer = await model.invoke(chatroles);

        res.json({ message: chatMessage, response: answer.content });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while processing the message' });
    }
});

const port = process.env.PORT || 3001;

app.listen(port, () => {
    console.log(`Server running on ${port}`);
});
