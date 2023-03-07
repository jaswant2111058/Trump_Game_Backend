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
             //   console.log({creater:socket.id,code:code})
                socket.name = code[0]
    })

    socket.on("Join",async code=>{
                        socket.join(`room${code.code}`);
                        socket.name=code.name
                        socket.code=code.code
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
                       // console.log({joiner:socket.id,code:code})
    })  
    socket.on("Essentials",async data=>{
    try{   
        socket.trumpPlayer = data.trump
        socket.teams=data.teams 
        const client = await io.in(`room${socket.code}`).fetchSockets()
       // console.log(client[0].id,client[1].id,client[2].id,client[3].id)
    if((data.teams%2)==1)
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
catch{
   // console.log('not define error')
}                   
}) 


socket.on('TrumpPlayer',num=>{

    io.to(`room${socket.code}`).emit('TrumpPlayer',num)
         
})



socket.on('start',num=>{

    io.to(`room${socket.code}`).emit('start',num)
         
})



socket.on("SendCard",async code=>{
   // console.log(code)
    
    try{
        const client = await io.in(`room${socket.code}`).fetchSockets()
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
        const name1 =
    {
        name1:client[0].name,
        name2:client[1].name,
        name3:client[2].name,
        name4:client[3].name
    }
    io.to(client[0].id).emit("CardArray",[player1,name1]);
    io.to(client[1].id).emit("CardArray",[player2,name1]);
    io.to(client[2].id).emit("CardArray",[player3,name1]);
    io.to(client[3].id).emit("CardArray",[player4,name1]);

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
                    var num = value.Cardnum;
            
            if((parseInt((value.Cardnum-1)/13))===(socket.trumpSuit-1))
            {
                num=value.Cardnum+230;
            }
            
            else if(value.suit===(parseInt((value.Cardnum-1)/13)))
            {
                num = value.Cardnum+52
            }
            socket.HandCheck=num
         //  console.log(socket.HandCheck,(socket.trumpSuit-1),(parseInt((value.Cardnum-1)/13)),num)
            if(value.inning==0)
            {
                
             client = await io.in(`room${socket.code}`).fetchSockets()
            const HandCheck =[
                client[0].HandCheck,
                client[1].HandCheck,
                client[2].HandCheck,
                client[3].HandCheck,
            ]
            if(HandCheck.length<=4)
            {  // console.log(value)
                let max = Math.max(HandCheck[0],HandCheck[1],HandCheck[2],HandCheck[3])
               let index= HandCheck.indexOf(max)
               if((client[0].teams%2)!==1&&(index==1||index==2))
               {
                index=(index%2)+1
               }
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
              //  console.log(index,HandCheck[0],HandCheck[1],HandCheck[2],HandCheck[3])
             }
            
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
                 }
        }
        catch{
            const data  = {
                index:null,
                Cardnum:value.Cardnum,
                Nextturn:value.Nextturn,
                turn:value.turn,
                inning:value.inning,
                count:value.count,
            }
            io.in(`room${socket.code}`).emit("Hand",data)
        } 
})

socket.on('disconnect', function() {
    const data = "game can't continue"
    io.in(`room${socket.code}`).emit("discon",data)
  })

    
})

http.listen(port, function(){
    console.log("Server is up");
})