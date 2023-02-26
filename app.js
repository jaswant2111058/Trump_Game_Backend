const express= require("express");
const app = express(); 
const path = require("path");
const port = process.env.PORT||5000;
const static1 = path.join(__dirname,) 
const http = require('http').Server(app);
const cors = require("cors")
app.use(cors())
app.use(express.static(static1));
const io = require('socket.io')(http,{
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
});
const players = require("./players")

const player1 = players.player1
const player2 = players.player2
const player3 = players.player3
const player4 = players.player4



io.on('connection',socket=>{

    console.log("connection")

   // socket.join("room");
    socket.on("Create",code=>{
 
                socket.join(`room${code[1]}`);
                socket.code = code[1]
                console.log({creater:socket.id,code:code})
                socket.name = code[0]
    })

    socket.on("Join",async code=>{
                        socket.join(`room${code.code}`);
                        socket.name=code.name
                        socket.code=code
                        const client = await io.in(`room${code.code}`).fetchSockets()
                       // console.log(client[client.length].name)
                        io.to(socket.id).emit("SetPlayer1",client[0].name);
                        let length = client.length
                        while(length--)
                        {       if(length>0)
                            {
                                io.to(`room${code.code}`).emit(`SetPlayer${length+1}`,client[length].name)
                            }
                        }
                        console.log({joiner:socket.id,code:code})
    })  
    socket.on("Essentials",async data=>{
       
        socket.trumpPlayer = data.trump
        socket.teams=data.teams
        const client = await io.in(`room${code}`).fetchSockets()
    console.log(client[0].id,client[1].id,client[2].id,client[3].id)
    io.to(client[0].id).emit("play",player1);
    io.to(client[1].id).emit("play",player2);
    io.to(client[2].id).emit("play",player3);
    io.to(client[3].id).emit("play",player4);
       // io.to(`room${socket.code}`).emit('play',data)
                       
}) 


socket.on('TrumpPlayer',num=>{

    io.to(`room${socket.code}`).emit('TrumpPlayer',num)
         
})



socket.on("SendCard",async code=>{
    console.log(code)
    
    try{
        const client = await io.in(`room${code}`).fetchSockets()
    console.log(client[0].id,client[1].id,client[2].id,client[3].id)
    io.to(client[0].id).emit("CardArray",player1);
    io.to(client[1].id).emit("CardArray",player2);
    io.to(client[2].id).emit("CardArray",player3);
    io.to(client[3].id).emit("CardArray",player4);
    }
    catch{
        console.log('there are not 4 player')
    }
})   
 

socket.on('trumpSuit',async play=>{

    socket.trumpSuit=play
    io.to(`room${socket.code}`).emit('trumpSuit',play)
})
socket.on('Suit',async play=>{

    socket.trumpSuit=play
})




socket.on('trumpSuit',async trumpSuit=>{

    io.to(`room${socket.code}`).emit('play',)



})





socket.on('CheckHand',async value=>{

        try{
            var client = await io.in(`room${socket.code}`).fetchSockets()
            
            if(parseInt(value.value/13)==client[0].trumpSuit)
            {
                value.value=value.value+52;
            }            
            socket.HandCheck=value.value
            if(value.turn==4)
            {
             client = await io.in(`room${socket.code}`).fetchSockets()
            const HandCheck =[
                client[0].HandCheck,
                client[1].HandCheck,
                client[2].HandCheck,
                client[3].HandCheck,

            ]
            if(HandCheck.length<=4)
            {
                let max = Math.max(HandCheck[0],HandCheck[1],HandCheck[2],HandCheck[3])
               let index= HandCheck.indexOf(max)
               index=index%4+2;
               if(index==1||index==3)
               {
                index=1
               socket.emit("Hand",index)
               }
               else{
                index = 2
                socket.emit("Hand",index)
               }
            }
        }
        else
        {
            socket.emit("Hand",0)
        }
        }
        catch{
            socket.emit("Hand",0)
        }
        
    
})





    
})


 app.get("/",function(req,res){

    
      
    res.sendFile(static1+"/testing.html");
});

app.get("/player1",(req,res)=>
{
    res.sendFile(static1+"/testclient.html");
    
})
app.post("/player1",async(req,res)=>
{       

    res.sendFile(static1+"/bingo.html");  
})

 app.get("/player2",function(req,res){
      
     res.sendFile(static1+"/bingo.html");
 });
 app.post("/player2",(req,res)=>
{       
    res.sendFile(static1+"/bingo.html");  
})

http.listen(port, function(){
    console.log("Server is up");
})