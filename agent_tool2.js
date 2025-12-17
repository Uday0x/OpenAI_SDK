//now the problem is
//we want a structured in some of the cases ,wherein it isnt just about the string output 
//so we use zod output

//now we use google gemini for the tool calling as strcuctured output


import "dotenv/config"
import axios from "axios"
import {z} from "zod"
import { Resend } from "resend"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { zodToJsonSchema } from "zod-to-json-schema";

//for strcutured Output

const weatherResultSchema=z.object({
    degree_c:z.number().describe("the degree celius of the temp"),
    condition:z.string().describe("condition of the weather")
})

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);


//craete a function of getweatherdetails
async function getWeather({city}) {
    const url = `https://wttr.in/${city}?format=%C+%t`;
    const res = await axios.get(url,{ responseType :"text"})
    return `Weather in ${city}:${res.data}`

}


//creating a function to send email
async function sendEmail({to,content}){
    await resend.emails.send({
     from: "Weather Bot <onboarding@resend.dev>",
     to,
     subject: "Weather Report",
    html: content,
    });
    return "Email sent successfully"
}

 let tools =[
  {
    functionDeclarations: [
      {
        name: "getWeather",
        description: "Get weather of a city",
        parameters: {
          type: "object",
          properties: {
            city: {
              type: "string",
              description: "Name of the city"
            }
          },
          required: ["city"]
        }
      },
      {
        name: "sendEmail",
        description: "Send weather report via email",
        parameters: {
          type: "object",
          properties: {
            to: {
              type: "string",
              description: "Receiver email address"
            },
            content: {
              type: "string",
              description: "Email body"
            }
          },
          required: ["to", "content"]
        }
      }
    ]
  }
]


const model = genAI.getGenerativeModel({
    model:'gemini-2.5-flash',
    tools:tools,
    config:{
    responseJsonSchema: zodToJsonSchema(weatherResultSchema),
    }
})

async function runAgent(query) {
  let messages = [{ role: "user", parts: [{ text: query }] }];

  while (true) {
  const result = await model.generateContent({ contents: messages });
  const part = result.response.candidates[0].content.parts[0];

  if (part.functionCall) {
    const { name, args } = part.functionCall;

    let toolResult;
    if (name === "getWeather") {
      toolResult = await getWeather(args);
    }
    if (name === "sendEmail") {
      toolResult = await sendEmail(args);
    }

    // Model function call
    messages.push({
      role: "model",
      parts: [{ functionCall: part.functionCall }]
    });

    // Function response (THIS IS IMPORTANT)
    messages.push({
      role: "function",
      parts: [
        {
          functionResponse: {
            name,
            response: { content: toolResult }
          }
        }
      ]
    });
  } else {
    console.log("Final:", part.text);
    break;
  }
}

}

runAgent(
  "Get weather of Hyderabad and email it to satyasailakshminarayana@gmail.com"
)
