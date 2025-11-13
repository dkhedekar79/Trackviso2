import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function QuoteRotator() {
  const quotes = [
  "You don’t need to be motivated — just don’t be lazy.",
  "Future you is watching right now. Don’t embarrass them.",
  "Discipline > Motivation. Every. Single. Time.",
  "Some people are praying for the opportunities you’re wasting.",
  "The work you do when no one’s watching decides who you become.",
  "You can cry, but finish the assignment first.",
  "Looking at stats isn't studying.",
  "It’s not that deep, just do it.",
  "All those times you said you would lock in, do it now.",
  "You’re not behind, you’re just early in your story.",
  "It's not a sprint. Nor a marathon. It's studying. Now work.",
  "Your ‘I’ll do it later’ is your biggest opp.",
  "You don’t need perfect music — just start.",
  "Six months of pure focus can change everything.",
  "Nobody cares how tired you are — show results.",
  "You’ve scrolled long enough to read this. Go revise.",
  "Your grades aren’t gonna ‘manifest’ themselves.",
  "Crazy how you want A’s but also 8 hours of TikTok.",
  "You’re not overwhelmed. You’re just avoiding it creatively.",
  "If you can overthink, you can overachieve.",
  "You don’t need another study playlist — you need to start.",
  "You said ‘I’ll do it later’… three days ago.",
  "You have WiFi, coffee, and a brain. Use one of them.",
  "The exam doesn’t care about your vibes.",
  "Every minute you waste is another panic attack in June.",
  "You’re not stuck, you’re just lazy with better excuses.",
  "Don’t call it burnout if you never even lit the fire.",
  "Your laptop isn’t broken — your discipline is.",
  "If procrastination was a subject, you’d ace it.",
  "Remember when you said you’d start early? Neither do I.",
];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % quotes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-8 flex items-center">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 1.2 }}
          className="text-lg font-semibold text-white text-center"
        >
          {quotes[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
