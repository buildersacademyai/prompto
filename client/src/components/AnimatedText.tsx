import { motion } from 'framer-motion';

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  type?: 'heading' | 'paragraph';
}

export default function AnimatedText({
  text,
  className = '',
  delay = 0,
  duration = 0.05,
  type = 'heading'
}: AnimatedTextProps) {
  const words = text.split(' ');
  
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { 
        staggerChildren: duration, 
        delayChildren: delay * i 
      }
    })
  };
  
  const child = {
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100
      }
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100
      }
    }
  };
  
  return (
    <motion.div
      className={`w-full mx-auto flex items-center justify-center overflow-hidden ${className}`}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
    >
      {type === 'heading' ? (
        <div className="flex flex-wrap items-center justify-center w-full">
          {words.map((word, index) => (
            <motion.span
              key={index}
              className="inline-block mr-2 mt-1"
              variants={child}
            >
              {word}&nbsp;
            </motion.span>
          ))}
        </div>
      ) : (
        <p className="flex flex-wrap">
          {words.map((word, index) => (
            <motion.span
              key={index}
              className="inline-block mr-1"
              variants={child}
            >
              {word}&nbsp;
            </motion.span>
          ))}
        </p>
      )}
    </motion.div>
  );
}