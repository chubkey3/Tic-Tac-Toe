const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: {
  origin: '*'
} });

var users = []

var won = false

var turn = 0 //0 or 1

var board = [
  ['', '', ''],
  ['', '', ''],
  ['', '', '']
]

const checkwin = () => {
  //win by row
  for (let i = 0; i<3; i++){
    if (board[i].every((val, i, arr) => val === arr[0]) && board[i][0] !== ''){
      return true
    }
  }

  //win by column
  for (let i = 0; i<3; i++){    
    if ([board[0][i], board[1][i], board[2][i]].every((val) => val === board[0][i]) && board[0][i] !== ''){
      return true
    }    
  }

  //win by diagonal (top left to bottom right)
  if (board[0][0] === board[1][1] && board[0][0] === board[2][2] && board[0][0] !== ''){
    return true
  }

  //win by diagonal (bottom left to top right)
  if (board[2][0] === board[1][1] && board[2][0] === board[0][2] && board[2][0] !== ''){
    return true
  }

  return false
}

io.on("connection", (socket) => {
  if (users.length === 2){
    socket.emit('full', 'Game is Full!')
    socket.disconnect()
    
  } else {

    users.push(socket.id)
    socket.emit('board', board)
    io.to(users[turn]).emit('turn', true);
    io.to(users[Number(!turn)]).emit('turn', false);

    socket.on("place", (coords) => {
      if (turn === users.indexOf(socket.id) && board[coords[0]][coords[1]] === '' && !won){
        board[coords[0]][coords[1]] = turn
        turn = Number(!turn)

        if (checkwin()){
          won = true;

          //send win message
          io.to(users[turn]).emit('won', false);
          io.to(users[Number(!turn)]).emit('won', true);    
        }

        //update board
        io.sockets.emit('board', board)
      }

      //update turn
      io.to(users[turn]).emit('turn', true);
      io.to(users[Number(!turn)]).emit('turn', false);

    })

    socket.on("clear", () => {
      if (won){
        board = [
          ['', '', ''],
          ['', '', ''],
          ['', '', '']
        ]

        won = false;
        
        io.sockets.emit('board', board)
      }      
    })

    socket.on("disconnect", () => {
      users.splice(users.indexOf(socket.id), 1)
    })
  }
});

httpServer.listen(3001);