import readline from "node:readline/promises";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import { tavily } from "@tavily/core";


dotenv.config();

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generate(userMessage) {

    const messages = [
        {
            role: 'system',
            content: `You are a smart personal assistent who answers the asked questions.
                You have access to following tools:
                1. searchWeb({query}: {query:string}) // Search the latest information and realtime data on the internet.
                current date and time: ${new Date().toUTCString()}`,
        },
    ];

    

    messages.push({
        role: 'user',
        content: userMessage,
    });

    //LLM React loop for tool calling it stop only when LLM does not send tool_calls in response unless the loop will be continously executing.
    while (true) {
        const completions = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            temperature: 0,
            messages: messages,
            tools: [
                {
                    type: "function",
                    function: {
                        name: "webSearch",
                        description: "Search the latest information and realtime data on the internet.",
                        parameters: {
                            type: "object",
                            properties: {
                                query: {
                                    type: "string",
                                    description: "The search query to perform search on."
                                },
                            },
                            required: ["query"],
                        }
                    }
                }
            ],

            tool_choice: 'auto',
        });


        messages.push(completions.choices[0].message);
        const toolCalls = completions.choices[0].message.tool_calls;
        if (!toolCalls) {
            return completions.choices[0].message.content;
        }

        for (const tool of toolCalls) {
            const functionName = tool.function.name;
            const functionParams = tool.function.arguments;

            if (functionName === 'webSearch') {
                const toolResult = await webSearch(JSON.parse(functionParams));

                messages.push({
                    tool_call_id: tool.id,
                    role: 'tool',
                    name: functionName,
                    content: toolResult
                })
            }
        }
    }
};




// Tool - Calling
async function webSearch({ query }) {
    // Here we will do tavily api call
    console.log("Calling web search...")
    const response = await tvly.search(query);
    const finalResult = response.results.map(result => result.content).join('\n\n');
    return finalResult;
}

