import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  delay?: number;
}

export default function FeatureCard({ 
  title, 
  description, 
  icon: Icon,
  delay = 0
}: FeatureCardProps) {
  return (
    <motion.div
      className="bg-card/50 backdrop-blur-md border border-primary/20 rounded-xl p-6 hover:shadow-glow transition-all duration-300"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ 
        opacity: 1, 
        y: 0,
        transition: { 
          duration: 0.5, 
          delay: delay * 0.2 
        }
      }}
      viewport={{ once: true, amount: 0.3 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
    >
      <div className="h-12 w-12 mb-4 bg-primary/20 rounded-full flex items-center justify-center">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}