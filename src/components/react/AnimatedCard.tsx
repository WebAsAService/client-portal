import React from 'react';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  scale?: boolean;
  lift?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  hover = true,
  scale = true,
  lift = true,
  glow = false,
  onClick
}) => {
  const baseClasses = 'transition-all duration-300 ease-out';

  const hoverClasses = hover ? [
    scale && 'hover:scale-[1.02]',
    lift && 'hover:shadow-xl hover:-translate-y-1',
    glow && 'hover:shadow-2xl hover:shadow-blue-500/20',
    'hover:border-blue-300'
  ].filter(Boolean).join(' ') : '';

  const clickableClasses = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default AnimatedCard;