import dotenv from 'dotenv'
import express from 'express';
import cors from "cors";
import { ChatOpenAI } from "@langchain/openai"

dotenv.config()
const app = express();
app.use(cors());

const model = new ChatOpenAI({
    azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
    azureOpenAIApiVersion: process.env.OPENAI_API_VERSION,
    azureOpenAIApiInstanceName: process.env.INSTANCE_NAME,
    azureOpenAIApiDeploymentName: process.env.ENGINE_NAME,
})

app.use(express.json())
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
        const quote = data.contents.quotes[0].quote;
        console.log("YOU GOT THIS GURLL")
        console.log(quote)
        return quote;
    } catch (error) {
        console.error('Error fetching the quote:', error);
        return 'Error fetching the quote';
    }
}

getQuote()

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

const port = process.env.PORT || 3001;

app.listen(port, () => {
    console.log(`Server running on ${port}`);
});

