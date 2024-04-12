import dotenv from 'dotenv'
import express from 'express';
import cors from "cors";
import { ChatOpenAI } from "@langchain/openai"

dotenv.config()

const app = express();
app.use(cors({ origin: "*" }));

const model = new ChatOpenAI({
    azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
    azureOpenAIApiVersion: process.env.OPENAI_API_VERSION,
    azureOpenAIApiInstanceName: process.env.INSTANCE_NAME,
    azureOpenAIApiDeploymentName: process.env.ENGINE_NAME,
})

app.use(express.json())
// Route to retrieve a joke
app.get('/joke', async (req, res) => {
    try {
        const joke = await model.invoke("Tell me a joke!");
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
            ["human", `Ik ben je kleinkind. Stel me gerust, geef me advies of hype me op of zeg simpelweg dat je trots op me bent ${messages.join(', ')}`]
        ];
        
        const answer = await model.invoke(chatroles);

        res.json({ answer: answer.content });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while processing the message' });
    }
});


app.listen(3001, () => {
    console.log("Server running on http://localhost:3001");
});

