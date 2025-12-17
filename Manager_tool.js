// Multi-agent system design patterns
//its better of to create a agent which does specfic work instead of creating an allrounder agent
//we have two types 
//Manager (agent as a tool)
//in this one agent tries to handle everything similar example of customer care agent tries to handle refund

import { Agent , run } from "@openai/agents"
import 'dotenv/config';  //important unless u give your apikey in the global dependency
const bookingAgent = new Agent({
    name:"Booking Agent",
    instructions:"answer booking questions and modify reservations"
})

const refundAgent = new Agent({
    name:"Refund expert",
    instructions:"help customers process refunds and credits"
})

const customerFacingAgent = new Agent({
    name:"customer-facing-agent",
    instructions:`talk to the user directly.when they need booking or refund help,call the matching tool`,
    tools:[
        bookingAgent.asTool({
            toolName:"booking_expert",
            toolDescription:"Handles booking questions and requests",
        }),


        refundAgent.asTool({
            toolName:"refund_expert",
            toolDescription:"handles refund questions and requests"
        })

    ]
})

async function main(query=""){
    const result = await run(customerFacingAgent,query)
    console.log(`Result`,result.finalOutput)
}

main(`hey hi I need a refund ,m not quiet happy iwth the product`)