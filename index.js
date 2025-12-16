import { Agent, run } from '@openai/agents';
import 'dotenv/config';



// const agent = new Agent({
//     name:"uday",
//     instructions:"you are a agent who always returns wishes such as good morning according to the time",
// });

//instrcutions can also be given in a dynamic mmaer
let location ="aus"
const agent = new Agent({
    name:"uday",
    instructions:function(){
        if(location === "india"){
            return "always start your answer with namsate and you are an agent who always return hello world"
        }
        else{
            return "speaks like an american agent who returns good mrng with with user name"
        }
    }
})


//instructions 
const result = await run(
    agent,
    "Hey there"
)

console.log(result.finalOutput)
