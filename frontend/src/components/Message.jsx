import React from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';

const MessageContainer = styled(motion.div)`
  margin: 1.5rem 0;
  padding: 1rem;
  background-color: var(--cell-bg);
  border-radius: var(--border-radius);
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  
  &.loading:after {
    content: '...';
    animation: loading-dots 1.5s infinite;
  }
  
  @keyframes loading-dots {
    0%, 20% { content: '.'; }
    40% { content: '..'; }
    60%, 100% { content: '...'; }
  }
`;

const Message = ({ text, isLoading }) => {
  return (
    <AnimatePresence mode="wait">
      <MessageContainer
        key={text}
        className={isLoading ? 'loading' : ''}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {text}
      </MessageContainer>
    </AnimatePresence>
  );
};

export default Message; 