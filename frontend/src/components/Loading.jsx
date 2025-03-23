// src/components/Loading.jsx
import { motion } from 'framer-motion';

const Loading = ({ message = 'Analyzing sentiment...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full"
      />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );
};

export default Loading;