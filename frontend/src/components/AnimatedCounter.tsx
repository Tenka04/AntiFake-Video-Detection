import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({ value, duration = 2, className = '' }: AnimatedCounterProps) {
  const [hasStarted, setHasStarted] = useState(false);
  
  const springValue = useSpring(0, {
    bounce: 0,
    duration: duration * 1000,
  });

  useEffect(() => {
    if (hasStarted) {
      springValue.set(value);
    }
  }, [value, springValue, hasStarted]);

  // Transform the spring value to an integer string
  const displayValue = useTransform(springValue, (current) => 
    Math.round(current).toLocaleString()
  );

  return (
    <motion.span 
      className={className}
      onViewportEnter={() => setHasStarted(true)}
      viewport={{ once: true }}
    >
      {displayValue}
    </motion.span>
  );
}
