//the need for guard rails arises when we want to limit the responses of the agent to a specific set of actions or topics
//we want some resctrictions on what a agent can do ,and what it cannot 

// Input guardrails
// Input guardrails run in three steps:

// The guardrail receives the same input passed to the agent.
// The guardrail function executes and returns a GuardrailFunctionOutput wrapped inside an InputGuardrailResult.
// If tripwireTriggered is true, an InputGuardrailTripwireTriggered error is thrown.
// Note Input guardrails are intended for user input, so they only run if the agent is the first agent in the workflow. Guardrails are configured on the agent itself because different agents often require different guardrails.

import "dotenv/config"
import { Agent,run,InputGuardrailTripwireTriggered } from "@openai/agents" //no need API again using process.env 
//@openai/agents automatically reads the env file
import { z } from "zod"

//craete a maths agent




//create a mathsInput agent which takes care of the input
const mathsInput  = new Agent({
    name:"Math query checker",
    instructions:`
    You are an input guardRail agent that checks if the user query is a maths question or not
    Rules:
    -The question has to be strictly a maths equation only.
    -Reject any other kind of request if not related to the maths
    `,
    outputType:z.object({
        isValidMathsQuestion:z.boolean().describe("if the question is maths question or not"),
        reason:z.string().optional().describe("reason tpo object")
    })
})

//now u can the write the code guardrail
const mathInputGuardRail ={
    name:"Math Input guardRail",
    execute:async({ input })=>{
        const result = await run(mathsInput,input)
        return {
            outputInfo:result.finalOutput.reason,
            tripwireTriggered:!result.finalOutput.isValidMathsQuestion
        }
    }
}

const mathsAgent = new Agent({
    name:"Maths Agent",
    instructions:"You are an expert maths AI agent",
    inputGuardrails:[mathInputGuardRail]
})

async function main(q ="") {
    try {
        const result = await run (mathsAgent,q)
        console.log(`Result`,result.finalOutput)
    } catch (error) {
        if( error instanceof InputGuardrailTripwireTriggered){
            console.log(`Input Input :Rejected because ${error.message}`)
        }
    }
}

main("write me a poem on inia")