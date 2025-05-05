import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const ControlsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1.5rem;
`;

const Button = styled(motion.button)`
  background-color: var(--primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 6px rgba(99, 102, 241, 0.25);
`;

const DifficultySelector = styled.div`
  display: flex;
  align-items: center;
`;

const Label = styled.label`
  margin-right: 0.5rem;
  font-weight: 500;
`;

const Select = styled.select`
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  border: 2px solid #E5E7EB;
  background-color: white;
  font-size: 0.9rem;
  transition: border-color 0.2s;
  cursor: pointer;
  outline: none;
  
  &:focus, &:hover {
    border-color: var(--primary);
  }
`;

// Reset icon SVG
const ResetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
    <path d="M3 3v5h5"></path>
  </svg>
);

const GameControls = ({ onNewGame, difficulty, setDifficulty }) => {
  return (
    <ControlsContainer>
      <Button 
        onClick={onNewGame}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        <ResetIcon />
        new game
      </Button>
      <DifficultySelector>
        <Label htmlFor="difficulty">algorithm difficulty:</Label>
        <Select 
          id="difficulty" 
          value={difficulty} 
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="easy">easy (lame)</option>
          <option value="medium">medium (lame)</option>
          <option value="hard">hard (like me)</option>
        </Select>
      </DifficultySelector>
    </ControlsContainer>
  );
};

export default GameControls; 