import './App.css';
import { useEffect } from 'react';
const { io } = require("socket.io-client")

const socket = io('http://localhost:3001')

socket.on('full', message => {
  console.log(message)
})

socket.on('board', (board) => {
  for (let i = 0; i<3; i++){
    for (let k = 0; k<3; k++){
      if (board[i][k] === 0){
        document.getElementById(3*i + k).innerHTML = 'X'
      } else if (board[i][k] === 1) {
        document.getElementById(3*i + k).innerHTML = 'O'
      } else {
        document.getElementById(3*i + k).innerHTML = ''
      }
      
    }
  }
})

socket.on('turn', (turn) => {
  if (turn){
    document.getElementById('turn-display').style.backgroundColor = 'green'
  } else {
    document.getElementById('turn-display').style.backgroundColor = 'red'
  }
})

socket.on('won', (outcome) => {
  if (outcome){
    alert('You Win!')
  } else {
    alert('You Lose!')
  }
})

function App() {

  const playMove = (move) => {
    socket.emit('place', move)
  }

  const disconnect = () => {
    socket.emit('disconnect')
  }

  const newGame = () => {
    socket.emit('clear')
  }

  useEffect(() => {
    window.onbeforeunload = () => disconnect();

    window.addEventListener('beforeunload', (e) => {

      disconnect();
    })

    return () => {
      disconnect();
      document.removeEventListener('beforeunload', disconnect);
    }
  })

  return (
    <div className="App">
      <header className="App-header">
        <div className='grid'>

          <div className='tile-container'>
          {[0,1,2].map((n) => (
            <button id={n} className='tile' onClick={() => {playMove([0, n])}}></button>
          ))}
          </div>

          <div className='tile-container'>
          {[0,1,2].map((n) => (
            <button id={3+n} className='tile' onClick={() => {playMove([1, n])}}></button>
          ))}
          </div>

          <div className='tile-container'>
          {[0,1,2].map((n) => (
            <button id={6+n} className='tile' onClick={() => {playMove([2, n])}}></button>
          ))}
          </div>
        </div>
        <div id='turn-display' className='turn-display'></div>
        <button onClick={newGame}>New Game</button>
      </header>
    </div>
  );
}

export default App;
