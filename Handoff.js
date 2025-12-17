import { Agent,run } from "@openai/agents";
import 'dotenv/config';


const bookingAgent = new Agent({
    name:`booking agent`,
    instructions:`help users with booking requests`
})


const refundAgent = new Agent({
    name:`Refund agent`,
    instructions:`Process refund requests politely and efficiently`
})



//the specilization hadnoff is the control is given to another agent
//its important to use Agent create method so taht it ensures handoff properly
const triAgent = Agent.create({
    name:"TriAgent",
    instructions:`
    help the user with their question
    If the user asks for booking,handoff to the booking agent
    if the user asks for refunds,handoff to the refund agent
    `.trimStart(), //removes whitesspecaes in the start
    handoffs:[bookingAgent,refundAgent]
})


async function main(query=""){
    const result = await run(triAgent,query)
    console.log(`Result`,result.finalOutput)
}


main(`hey hi I need a refund `)
