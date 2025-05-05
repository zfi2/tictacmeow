import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { XMark, OMark } from './Marks';

const CellContainer = styled(motion.div)`
  background-color: var(--cell-bg);
  aspect-ratio: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 3rem;
  font-weight: bold;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  
  &:hover {
    background-color: var(--cell-hover);
    transform: translateY(-3px);
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
  }
  
  &.winner {
    background-color: var(--winner-bg);
  }
`;

const Cell = ({ value, onClick, row, col, isWinner }) => {
  const getCellContent = () => {
    if (value === 'X') {
      return <XMark />;
    } else if (value === 'O') {
      return <OMark />;
    }
    return null;
  };

  const handleClick = () => {
    // only call onClick if the cell is empty
    if (value === 'Empty' && onClick) {
      onClick(row, col);
    }
  };

  const isEmpty = value === 'Empty' || value === null;

  return (
    <CellContainer
      className={isWinner ? 'winner' : ''}
      onClick={handleClick}
      whileHover={isEmpty ? { scale: 1.05 } : {}}
      whileTap={isEmpty ? { scale: 0.95 } : {}}
      animate={isWinner ? { 
        backgroundColor: ["var(--cell-bg)", "var(--winner-bg)", "var(--winner-bg)"],
        boxShadow: ["0 2px 5px rgba(0, 0, 0, 0.05)", "0 0 12px rgba(167, 243, 208, 0.7)", "0 0 0 rgba(167, 243, 208, 0)"]
      } : {}}
      transition={isWinner ? { 
        repeat: Infinity, 
        duration: 1.5,
        repeatType: "reverse"
      } : {}}
      data-row={row}
      data-col={col}
    >
      {getCellContent()}
    </CellContainer>
  );
};

export default Cell; 