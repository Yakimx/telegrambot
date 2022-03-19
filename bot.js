const { Telegraf, Markup } = require('telegraf')
require('dotenv').config()
const text = require('./const')
const wordsRemBox = require('./words')

const bot = new Telegraf(process.env.BOT_TOKEN)
bot.start((ctx) => ctx.reply(`Привет ${ctx.message.from.first_name ? ctx.message.from.first_name: 'noname'}`))
bot.help((ctx) => ctx.reply(text.commands))

let state = 
    {
        teacherId:  "",
        teacherIdRmb:  "",
        jobTimer:  false,
        jobTimerRmb:  false,         
        intervalTimer:  1200000,
        users: [],
    }



bot.command('go', async (ctx) => {
    try{                 
        await addUser(ctx);
        if(!state.jobTimer) await startTeacher();       
    
    } catch (e){
        console.error(e)
    }    
    //console.log(state)
})

bot.command('gormb', async (ctx) => {
    try{                 
        await addUser(ctx);
        if(!state.jobTimerRmb) await startTeacherRmb();       
    
    } catch (e){
        console.error(e)
    }    
    //console.log(state)
})



bot.command('can', async (ctx) => {
    try{
        await delUser(ctx);
        await stopTeacher(state.teacherId);
    } catch (e){
        console.error(e)
    }   
    //console.log(state) 
})



const startTeacher = ()=>{  

    state.teacherId = setInterval(() => { 
        let word = Wordgenerator(text);   
        state.users.map((user)=>{
        bot.telegram.sendMessage(user.id, word)
        })            
        }, state.intervalTimer);
        state.jobTimer = true;
}

const startTeacherRmb = ()=>{  

    state.teacherIdRmb = setInterval(() => { 
        let word = Wordgenerator(wordsRemBox);   
        state.users.map((user)=>{
        bot.telegram.sendMessage(user.id, word)
        })            
        }, state.intervalTimer);
        state.jobTimerRmb = true;
}



const stopTeacher = (teacherId)=>{
    if (state.users.length == 0) {
        clearInterval(teacherId);
        clearInterval(teacherIdRmb);
        state.jobTimer = false;
    }
  }

const Wordgenerator = (text)=>{ 
    let word = text.words.split(/^/m);    
    return  word[getRandomIntInclusive(0, word.length-1)];
    //console.log(x)   
} 
 

  function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //Максимум и минимум включаются
  }


const addUser = (ctx)=>{
    
    if(!chekUser(ctx.message.from.id)){
    state = {...state,
        users:[...state.users,
            {
           firstName: ctx.message.from.first_name,
           userName: ctx.message.from.username,
           id: ctx.message.from.id,
            }
        ]
    }
    }  
}

const delUser = (ctx)=>{
    
    if(chekUser(ctx.message.from.id)){
        state = {...state,
            users:
                state.users.filter((el)=>{
                    return el.id !== ctx.message.from.id
                })
            
        }
    }  
}

const chekUser = (id)=>{    
   return state.users.some((el)=>{                
       return el.id == id ? true : false;
     }) 

}


bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
