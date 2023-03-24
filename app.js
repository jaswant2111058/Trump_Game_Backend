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
                        socket.code=code.code
                        const client = await io.in(`room${code.code}`).fetchSockets()
                        console.log(client[client.length-1].name)
                        io.to(socket.id).emit("SetPlayer1",client[0].name);
                        let length = client.length
                        while(length--)
                        {       if(length>0)
                            {
                                io.to(`room${code.code}`).emit(`SetPlayer${length+1}`,client[length].name)
                            }
                        }
                       // console.log({joiner:socket.id,code:code})
    })
    socket.on('reConnection',async data =>{
        socket.join(`room${data.code}`);
        socket.code = data.code
        socket.playerNo = data.playerNo
        socket.trumpPlayer = data.trumpPlayer
        socket.name=data.name
        socket.player1 = data.player1
        socket.player2 = data.player2
        socket.player3 = data.player3
        socket.player4 = data.player4
    })

    socket.on("Essentials",async data=>{
    try{   
        socket.trumpPlayer = data.trump
        socket.teams=data.teams 
        const client = await io.in(`room${socket.code}`).fetchSockets()
       // console.log(client[0].id,client[1].id,client[2].id,client[3].id)
    if((data.teams%2)===1)
    {
        io.to(client[1].id).emit("play",2);
        io.to(client[2].id).emit("play",3);
    }
    else
    {
        io.to(client[1].id).emit("play",3);
        io.to(client[2].id).emit("play",2);
    }
    io.to(client[3].id).emit("play",4); 
    // io.to(`room${socket.code}`).emit('play',data)
}
catch(err){
    console.log(err+'not enough player')
}                   
}) 

socket.on('TrumpPlayer',num=>{
    io.to(`room${socket.code}`).emit('TrumpPlayer',num)
})



socket.on('start',num=>{
    io.to(`room${socket.code}`).emit('start',num)    
})



socket.on("SendCard",async code=>{
    console.log(socket.id,code)
    
    try{
       // const client = await io.in(`room${socket.code}`).fetchSockets()
        var arr = [];
        for(let i=0;i<52;i++)
        {
          arr[i]=i+1;
        }
           arr.sort(function()
           {return 0.5- Math.random()});
        
        const player1=[] 
        for(let i=0;i<13;i++)
        {
          player1[i]=arr[i];
        }
        let player2=[]
        for(let i=0;i<13;i++)
        {
          player2[i]=arr[i+13];
        }
        let player3=[]
        for(let i=0;i<13;i++)
        {
          player3[i]=arr[i+26];
        }
        let player4=[]
        for(let i=0;i<13;i++)
        {
          player4[i]=arr[i+39];
        }
        const player =
    [player1,player2,player3,player4]
    // io.to(client[0].id).emit("CardArray",[player1,name1]);
    // io.to(client[1].id).emit("CardArray",[player2,name1]);
    // io.to(client[2].id).emit("CardArray",[player3,name1]);
    // io.to(client[3].id).emit("CardArray",[player4,name1]);
     io.to(`room${socket.code}`).emit('CardArray',player)
    }
    catch{
        console.log('there are not 4 player')
    }
})   
 

socket.on('trumpSuit', play=>{
    socket.trumpSuit=play
    io.to(`room${socket.code}`).emit('trumpSuits',play)
})
socket.on('Suit', play=>{

    socket.trumpSuit=play
})


 socket.on('switch',data=>{
             //   console.log(data)
             io.to(`room${socket.code}`).emit('Switch',data)  
          })
           


socket.on('CheckHand',async value=>{

        try{
            if(value.inning==0)
            {
                const client = await io.in(`room${socket.code}`).fetchSockets()
              const  HandCheck =[
                value.chaal[0],
                value.chaal[1],
                value.chaal[2],
                value.Cardnum
              ]
                let max = Math.max(value.chaal[0],value.chaal[1],value.chaal[2],value.Cardnum)
               let index= HandCheck.indexOf(max)
            //    if((client[0].teams%2)!==1&&(index==1||index==2))
            //    {
            //     index=(index%2)+1 
            //    }
            const data  = {
                win:index,
                index:index,
                Cardnum:value.Cardnum,
                Nextturn:index,
                turn:value.turn,
                inning:value.inning,
                count:value.count,
            }
                io.in(`room${socket.code}`).emit("Hand",data)
                console.log(index,max,value)
        
            
        }
        else
        {
            const data  = {
                win:null,
                Cardnum:value.Cardnum,
                index:value.Nextturn,
                turn:value.turn,
                inning:value.inning,
                count:value.count,
            }
            io.in(`room${socket.code}`).emit("Hand",data)
           // console.log(data)
                 }
        }
        catch(err){
            console.log(err);
        } 
})

socket.on('disconnect', function() {
    const data = "game can't continue"
   // io.in(`room${socket.code}`).emit("discon",data)
   console.log('disconnect')
  })
})

http.listen(port, function(){
    console.log("Server is up");
})