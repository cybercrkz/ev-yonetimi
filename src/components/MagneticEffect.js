import React, { useRef, useState, useEffect } from 'react';

/**
 * MagneticEffect - Adds a high-end magnetic hover effect to buttons or icons.
 * A signature element of the "UI/UX Pro Max" design language.
 */
const MagneticEffect = ({ children, strength = 0.3 }) => {
  const containerRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    const moveX = (clientX - centerX) * strength;
    const moveY = (clientY - centerY) * strength;
    
    setPosition({ x: moveX, y: moveY });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        display: 'inline-block',
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        transition: position.x === 0 ? 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)' : 'none'
      }}
    >
      {children}
    </div>
  );
};

export default MagneticEffect;
