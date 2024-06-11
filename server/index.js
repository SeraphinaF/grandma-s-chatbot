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

// Function to fetch an inspiring quote
async function getQuote() {
    try {
        const response = await fetch('https://quotes.rest/qod?category=inspire&language=en', {
            headers: {
                'Content-Type': 'application/json',
                'X-TheySaidSo-Api-Secret': process.env.QUOTES_API_KEY // Use your API key if required
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch the quote');
        }

        const data = await response.json();
        const quote = data.contents.categories.inspire;
        console.log(quote)
        return quote;
    } catch (error) {
        console.error('Error fetching the quote:', error.message);
        return 'Error fetching the quote';
    }
}

// Route to handle chat messages
app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const messages = Array.isArray(message) ? message : [message];

        const quote = await getQuote();
        console.log(quote)

        const chatroles = [
            ["system", `You are an old sweet lady. All your messages are a maximum of 45 words`],
            ["human", `Give me advice if I ask you a question or just give me some kind words. You also always add a "${quote}" to cheer me up.${messages.join(', ')}`]
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
