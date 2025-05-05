import React from 'react';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';

const SvgContainer = styled.div`
  width: 60%;
  height: 60%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

// X mark with an animation
export const XMark = () => {
  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1,
      transition: { 
        duration: 0.5,
        ease: "easeInOut"
      }
    }
  };

  return (
    <SvgContainer>
      <motion.svg viewBox="0 0 24 24" width="100%" height="100%">
        <motion.path
          d="M18 6L6 18M6 6l12 12"
          stroke="var(--x-color)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          variants={pathVariants}
          initial="hidden"
          animate="visible"
        />
      </motion.svg>
    </SvgContainer>
  );
};

// O Mark with animation
export const OMark = () => {
  const circleVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1,
      transition: { 
        duration: 0.5,
        ease: "easeInOut"
      }
    }
  };

  return (
    <SvgContainer>
      <motion.svg viewBox="0 0 24 24" width="100%" height="100%">
        <motion.circle
          cx="12"
          cy="12"
          r="8"
          stroke="var(--o-color)"
          strokeWidth="3"
          fill="none"
          variants={circleVariants}
          initial="hidden"
          animate="visible"
        />
      </motion.svg>
    </SvgContainer>
  );
}; 