import dotenv from 'dotenv'
import express from 'express';
import cors from "cors";
import { ChatOpenAI } from "@langchain/openai"

dotenv.config()
const app = express();
app.use(cors());
app.use(express.json());

const model = new ChatOpenAI({
    azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
    azureOpenAIApiVersion: process.env.OPENAI_API_VERSION,
    azureOpenAIApiInstanceName: process.env.INSTANCE_NAME,
    azureOpenAIApiDeploymentName: process.env.ENGINE_NAME,
});

// Route to handle chat messages
app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const messages = Array.isArray(message) ? message : [message];

        // Define the chat roles as a sweet old lady
        const chatRoles = [
            ["system", "Mijn lieve, wat fijn dat je met me praat. Ik ben altijd hier om je te helpen en naar je te luisteren. Laat me weten hoe ik je kan bijstaan."],
            ["human", ...messages] // Let the human messages be whatever user inputs
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
