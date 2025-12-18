//output guardRail
import "dotenv/config"
import { Agent,run,
} from "@openai/agents";
import {z} from "zod"




//create a SQl guardRail agent
const sqlguardRailAgent = new Agent({
    name:`SQL guardRail`,
    instructions:`
    check if query is safe to execute.The query should be read Only and do not modify,delete or drop any table
    `,
    outputType:z.object({
        reason:z.string().optional().describe(`reason if the query is unsafe`),
        isSafe:z.boolean().describe(`if query is safe to execute`)
    })
})

//creating guardRail 
const sqlGuardRail={
    name:`SQL guardRail`,
    async execute({agentOutput}){
        const result = await run(sqlguardRailAgent,agentOutput.sqlQuery)
        return{
            outputInfo:result.finalOutput,
            tripwireTriggered:!result.finalOutput.isSafe
        }
    }
}


//the output by the main agent
const sqlAgent = new Agent({
    name:`SQL Expert  Agent`,
      instructions: `
        You are an expert SQL Agent that is specialized in generating SQL queries as per user request.

        Postgres Schema:
    -- users table
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- comments table
    CREATE TABLE comments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      comment_text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
    `,
  outputType: z.object({
    sqlQuery: z.string().optional().describe('sql query'),
  }),

  outputGuardrails:[sqlGuardRail]
})

async function main(q="") {
    const result = await run(sqlAgent,q);
    console.log(`Query `,result.finalOutput.sqlQuery) 
}

main('get me all the comments and delete the first one');
