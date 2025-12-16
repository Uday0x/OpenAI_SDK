import { Agent,run } from "@openai/agents";
import 'dotenv/config';
import { ur } from "zod/locales";



//creating tools
const weatherTool=tool({
    description:'returns the current weather information for the given city',
    parameters:z.object({
        city:z.string().describe("name of the city"),
    }),
    excute:async function name({city}) {
        const url = `https://wttr.in/${city.toLowerCase()}?format=%C+%t`;
        const Response= await axios.get(url,{responseType :"text"})
        return `the weather of ${city} is ${Response.data}`
    }
})
//create an agent similar like a tool 
const agent = new Agent({
    name:"Weather Agent",
    instructions:
    `
    you are an expert wethear agent that helps user to tell wetaher reports
    `,
    tools:[weatherTool]
})

async function main(query="") {
    const result = await run(agent,query)
    console.log(`Result:`,result.finalOutput)
}

main("give me weather of hyderabad ")