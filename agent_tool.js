//weather EMAIL AGENT


import { Agent, run, tool } from "@openai/agents";
import "dotenv/config";
import { ur } from "zod/locales";
import { Resend } from "resend";
import { z } from "zod";
import axios from "axios";

const resend = new Resend(process.env.RESEND_API_KEY);

//for strcutured output 

const weatherResultSchema=z.object({
    degree_c:z.number().describe("the degree celius of the temp"),
    condition:z.string().describe("condition of the weather")
})

//creating tools
const weatherTool = tool({
  description: "returns the current weather information for the given city",
  parameters: z.object({
    city: z.string().describe("name of the city"),
  }),
  execute: async function name({ city }) {
    const url = `https://wttr.in/${city.toLowerCase()}?format=%C+%t`;
    const Response = await axios.get(url, { responseType: "text" });
    return `the weather of ${city} is ${Response.data}`;
  },
});

const emailTool = tool({
  description: "send email to the given email address",
  parameters: z.object({
    to: z.string().email(),
    content: z.string(),
  }),

  execute: async ({ to, content }) => {
    await resend.emails.send({
      from: "Weather Bot <onboarding@resend.dev>",
      to,
      subject: "Weather Report",
      html: content,
    });
    return "Email sent successfully";
  },
});

//create an agent similar like a tool
const agent = new Agent({
 name: "Weather Email Agent",
  instructions: `
You are a weather assistant.
Steps:
1. Use weatherTool to get weather of the city.
2. Use emailTool to send that weather report to the user.
`,
  tools: [weatherTool, emailTool],
  outputType:weatherResultSchema
});

async function main(query = "") {
  const result = await run(agent, query);
  console.log(`Result:`, result.finalOutput);
}

main("Send weather of  Guwahati to satyasailakshminarayana@gmail.com");
