import React from 'react';
import Cell from './Cell';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';

const BoardContainer = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 12px;
  margin-top: 1.5rem;
`;

const Board = ({ board, onCellClick, winningCells }) => {
  return (
    <BoardContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {board.cells.flat().map((value, index) => {
        const row = Math.floor(index / 3);
        const col = index % 3;
        const isWinningCell = winningCells?.some(
          cell => cell[0] === row && cell[1] === col
        );

        return (
          <Cell
            key={`${row}-${col}`}
            value={value}
            onClick={() => onCellClick(row, col)}
            row={row}
            col={col}
            isWinner={isWinningCell}
          />
        );
      })}
    </BoardContainer>
  );
};

export default Board; 