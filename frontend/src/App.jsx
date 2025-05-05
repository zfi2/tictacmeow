import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import Board from './components/Board';
import GameControls from './components/GameControls';
import Message from './components/Message';

const Container = styled(motion.div)`
  text-align: center;
  background-color: white;
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  max-width: 500px;
  width: 90%;
`;

const Title = styled(motion.h1)`
  margin-bottom: 1.5rem;
  color: var(--primary);
  font-size: 2.5rem;
  font-weight: 700;
  text-shadow: 1px 1px 1px rgba(0,0,0,0.1);
  position: relative;
  display: inline-block;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 50px;
    height: 4px;
    background: var(--secondary);
    border-radius: 2px;
  }
`;

const Footer = styled.div`
  margin-top: 2rem;
  font-size: 0.9rem;
  color: #6B7280;
`;

function App() {
  const [board, setBoard] = useState({ 
    cells: Array(3).fill().map(() => Array(3).fill('Empty')),
    current_player: 'X',
    status: 'InProgress'
  });
  const [gameMessage, setGameMessage] = useState("Loading game...");
  const [isLoading, setIsLoading] = useState(false);
  const [difficulty, setDifficulty] = useState("medium");
  const [winningCells, setWinningCells] = useState(null);
  
  // Fetch initial game state
  useEffect(() => {
    fetchGameState();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  async function fetchGameState() {
    try {
      const response = await fetch('/api/game');
      const data = await response.json();
      console.log("Fetched game state:", data);
      setBoard(data.board);
      setGameMessage(data.message);
      checkGameStatus(data.board);
    } catch (error) {
      console.error('Error fetching game state:', error);
      setGameMessage('Error fetching game state. Please try again.');
    }
  }
  
  async function startNewGame() {
    try {
      setIsLoading(true);
      setGameMessage('Starting new game...');
      setWinningCells(null);
      
      const response = await fetch('/api/game', {
        method: 'POST'
      });
      const data = await response.json();
      console.log("New game response:", data);
      
      setBoard(data.board);
      setGameMessage(data.message);
      setIsLoading(false);
    } catch (error) {
      console.error('Error starting new game:', error);
      setGameMessage('Error starting game. Please try again.');
      setIsLoading(false);
    }
  }
  
  async function handleCellClick(row, col) {
    // Check if the cell is already filled or if the game is loading or over
    if (isLoading) return;
    
    // Check if game is over
    if (board.status !== 'InProgress') return;
    
    // Check if the cell is already filled
    if (board.cells[row][col] !== 'Empty') return;
    
    try {
      setIsLoading(true);
      console.log(`Making move at ${row},${col}`);
      
      const response = await fetch('/api/game/move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ row, col })
      });
      
      if (!response.ok) {
        throw new Error('Invalid move');
      }
      
      const data = await response.json();
      console.log("Move response:", data);
      setBoard(data.board);
      setGameMessage(data.message);
      
      const gameOver = checkGameStatus(data.board);
      
      if (!gameOver) {
        setGameMessage('AI is thinking...');
        setTimeout(() => makeAIMove(), 700);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error making move:', error);
      setGameMessage('Error making move. Please try again.');
      setIsLoading(false);
    }
  }
  
  async function makeAIMove() {
    try {
      const response = await fetch(`/api/game/ai-move/${difficulty}`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('AI move failed');
      }
      
      const data = await response.json();
      console.log("AI move response:", data);
      setBoard(data.board);
      setGameMessage(data.message);
      
      checkGameStatus(data.board);
      setIsLoading(false);
    } catch (error) {
      console.error('Error making AI move:', error);
      setGameMessage('AI move failed. Your turn.');
      setIsLoading(false);
    }
  }
  
  function checkGameStatus(board) {
    if (board.status !== 'InProgress') {
      if (board.status && board.status.Winner) {
        findWinningCells(board, board.status.Winner);
        return true;
      } else if (board.status === 'Draw') {
        setWinningCells(null);
        return true;
      }
    }
    setWinningCells(null);
    return false;
  }
  
  function findWinningCells(board, winner) {
    // Check rows
    for (let i = 0; i < 3; i++) {
      if (board.cells[i][0] === winner && board.cells[i][1] === winner && board.cells[i][2] === winner) {
        setWinningCells([[i, 0], [i, 1], [i, 2]]);
        return;
      }
    }
    
    // Check columns
    for (let j = 0; j < 3; j++) {
      if (board.cells[0][j] === winner && board.cells[1][j] === winner && board.cells[2][j] === winner) {
        setWinningCells([[0, j], [1, j], [2, j]]);
        return;
      }
    }
    
    // Check diagonals
    if (board.cells[0][0] === winner && board.cells[1][1] === winner && board.cells[2][2] === winner) {
      setWinningCells([[0, 0], [1, 1], [2, 2]]);
      return;
    }
    
    if (board.cells[0][2] === winner && board.cells[1][1] === winner && board.cells[2][0] === winner) {
      setWinningCells([[0, 2], [1, 1], [2, 0]]);
      return;
    }
  }

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Title
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        tic tac meow :3
      </Title>
      
      <GameControls
        onNewGame={startNewGame}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
      />
      
      <Message 
        text={gameMessage} 
        isLoading={isLoading} 
      />
      
      <Board 
        board={board} 
        onCellClick={handleCellClick}
        winningCells={winningCells}
      />
      
      <Footer>
        <p>built with 🐱</p>
      </Footer>
    </Container>
  );
}

export default App; 