import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

interface AnimatedButtonProps {
  text: string;
  href?: string;
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
  onClick?: () => void;
  size?: 'default' | 'sm' | 'lg';
}

export default function AnimatedButton({
  text,
  href,
  variant = 'default',
  className = '',
  onClick,
  size = 'default'
}: AnimatedButtonProps) {
  const buttonVariants = {
    idle: {
      scale: 1,
      boxShadow: '0 0 0 rgba(153, 69, 255, 0)'
    },
    hover: {
      scale: 1.05,
      boxShadow: '0 0 20px rgba(153, 69, 255, 0.5)'
    },
    tap: { 
      scale: 0.95 
    }
  };

  const content = (
    <motion.div
      className="w-full"
      initial="idle"
      whileHover="hover"
      whileTap="tap"
      variants={buttonVariants}
    >
      <Button 
        variant={variant} 
        size={size}
        className={`relative group ${className}`}
        onClick={onClick}
      >
        <span className="relative z-10">{text}</span>
        <motion.div
          className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 bg-gradient-to-r from-primary via-accent to-primary bg-size-200"
          initial={{ opacity: 0 }}
          whileHover={{ 
            opacity: 0.3,
            transition: { duration: 0.3 }
          }}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            backgroundPosition: {
              duration: 5,
              repeat: Infinity,
              ease: "linear"
            }
          }}
        />
      </Button>
    </motion.div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}