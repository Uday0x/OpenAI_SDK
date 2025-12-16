import { Agent, run } from '@openai/agents';
import 'dotenv/config';



// const agent = new Agent({
//     name:"uday",
//     instructions:"you are a agent who always returns wishes such as good morning according to the time",
// });

//instrcutions can also be given in a dynamic mmaer

const agent = new Agent({
    name:"uday",
    
})


//instructions 
const result = await run(
    agent,
    "Hey there"
)

console.log(result.finalOutput)
