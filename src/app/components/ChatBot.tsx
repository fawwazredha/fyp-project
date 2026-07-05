import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const quickPrompts = [
  "What is CKD?",
  "How serious is my result?",
  "What should I do next?",
  "What are CKD symptoms?"
];

const botResponses: Record<string, string> = {
  "what is ckd?": "Chronic Kidney Disease (CKD) is a condition where your kidneys gradually lose their ability to filter waste and excess fluids from your blood. It develops over time and can be caused by diabetes, high blood pressure, or other conditions. Early detection is crucial for better management.",
  "how serious is my result?": "Your assessment result indicates your risk level based on several health factors. If you received a 'High' or 'Moderate' risk result, it's important to consult with a healthcare professional for proper evaluation. Remember, this is a screening tool, not a diagnosis.",
  "what should i do next?": "Based on your risk level:\n• Low Risk: Maintain healthy lifestyle habits and get annual checkups\n• Moderate Risk: Schedule a doctor consultation within a month\n• High Risk: See a nephrologist (kidney specialist) as soon as possible\n\nYou can book an appointment through our platform!",
  "what are ckd symptoms?": "Early CKD often has no symptoms. As it progresses, you may experience:\n• Fatigue and weakness\n• Swelling in feet, ankles, or hands\n• Shortness of breath\n• Changes in urination\n• Nausea or loss of appetite\n\nIf you experience these, please consult a doctor immediately."
};

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your CKD Health Assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simulate bot response
    setTimeout(() => {
      const response = getBotResponse(text);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 500);
  };

  const getBotResponse = (userText: string): string => {
    const normalized = userText.toLowerCase().trim();
    
    for (const [key, response] of Object.entries(botResponses)) {
      if (normalized.includes(key.toLowerCase())) {
        return response;
      }
    }

    return "I understand you're looking for information about CKD. While I can provide general information, please remember that this is not medical advice. For specific concerns, please consult with a healthcare professional. You can use the quick prompts below for common questions!";
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#3A86FF] to-[#2EC4B6] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">CKD Assistant</h3>
                  <p className="text-xs text-white/80">Always here to help</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.sender === 'user'
                        ? 'bg-[#3A86FF] text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Prompts */}
            <div className="px-4 py-2 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSendMessage(prompt)}
                    className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                  placeholder="Type your question..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#3A86FF]/50"
                />
                <button
                  onClick={() => handleSendMessage(inputValue)}
                  className="w-10 h-10 bg-[#3A86FF] text-white rounded-full flex items-center justify-center hover:bg-[#2E6FD9] transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-[#3A86FF] to-[#2EC4B6] text-white rounded-full shadow-lg flex items-center justify-center z-50 hover:shadow-xl transition-shadow"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>
    </>
  );
}
