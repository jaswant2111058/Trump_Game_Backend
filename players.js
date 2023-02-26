
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

const PalyersArray={
player1:player1,
player2:player2,
player3:player3,
player4:player4

}


module.exports=PalyersArray;