//we try using gemini model with guardrails

//creating a agent using gemini to check if is a maths query
import { Agent,run,InputGuardrailTripwireTriggered } from "@openai/agents"
import "dotenv/config"
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

 async function IsMathQuery(input) {
    const model = genAI.getGenerativeModel({
        model:"gemini-1.0-pro"
    });


const prompt =
`
classify the input.
Return only JSON.


Input:"${input}"

JSON:{
"isMath":boolean,
"reason":string
}
`;

const result = await model.generateContent(prompt);
const text = result.response.text();

return JSON.parse(text);
}

//guardRail

const mathInputGuardRail ={
    name:"Gemini maths gaurdRail",


    execute:async({input})=>{
        const result = await IsMathQuery(input);

        return {
            tripwireTriggered:!result.isMath,
            outputInfo:result.reason
        }
    }
}

const mathsAgent = new Agent({
    name:"Maths Agent",
    instructions:"solve the maths problem step by step",
    inputGuardrails:[mathInputGuardRail]
})

await run(mathsAgent,"solve 3+4*6")