// components/question/SubmissionGuidelines.jsx
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  Lightbulb, 
  Zap, 
  Clock,
  ThumbsUp,
  Shield,
  Users
} from 'lucide-react';

const SubmissionGuidelines = ({ currentStep = 1 }) => {
  const guidelines = [
    {
      step: 1,
      title: 'Writing a Good Title',
      icon: Lightbulb,
      tips: [
        'Be specific about your problem',
        'Include key technologies',
        'Keep it under 150 characters',
        'Imagine you\'re asking another person'
      ]
    },
    {
      step: 2,
      title: 'Providing Details',
      icon: Zap,
      tips: [
        'Describe what you\'re trying to accomplish',
        'Include code examples',
        'Show what you\'ve tried',
        'Explain expected vs actual results'
      ]
    },
    {
      step: 3,
      title: 'Choosing Tags',
      icon: Users,
      tips: [
        'Use relevant technology tags',
        'Maximum 5 tags',
        'Avoid generic tags',
        'Check similar questions for inspiration'
      ]
    },
    {
      step: 4,
      title: 'Final Review',
      icon: CheckCircle,
      tips: [
        'Proofread for typos',
        'Format code properly',
        'Ensure question is clear',
        'Check tag relevance'
      ]
    }
  ];

  const currentGuidelines = guidelines.find(g => g.step === currentStep) || guidelines[0];
  const Icon = currentGuidelines.icon;

  return (
    <div className="space-y-6">
      {/* Current Step Guidelines */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <Icon size={24} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {currentGuidelines.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Step {currentStep} of 4
            </p>
          </div>
        </div>
        
        <ul className="space-y-3">
          {currentGuidelines.tips.map((tip, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-2"
            >
              <CheckCircle size={14} className="text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{tip}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* General Guidelines */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-blue-900 to-blue-950 rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Shield size={20} className="text-blue-300" />
          <h3 className="font-semibold text-white">
            Community Guidelines
          </h3>
        </div>
        
        <ul className="space-y-3">
          <li className="flex items-start gap-2">
            <div className="h-2 w-2 bg-blue-300 rounded-full mt-1.5 flex-shrink-0" />
            <span className="text-sm text-blue-200">
              Be respectful and inclusive
            </span>
          </li>
          <li className="flex items-start gap-2">
            <div className="h-2 w-2 bg-blue-300 rounded-full mt-1.5 flex-shrink-0" />
            <span className="text-sm text-blue-200">
              Search before asking
            </span>
          </li>
          <li className="flex items-start gap-2">
            <div className="h-2 w-2 bg-blue-300 rounded-full mt-1.5 flex-shrink-0" />
            <span className="text-sm text-blue-200">
              Provide minimal reproducible examples
            </span>
          </li>
          <li className="flex items-start gap-2">
            <div className="h-2 w-2 bg-blue-300 rounded-full mt-1.5 flex-shrink-0" />
            <span className="text-sm text-blue-200">
              Accept answers that solve your problem
            </span>
          </li>
        </ul>
      </motion.div>

      {/* Tips for Better Responses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-green-900 to-emerald-950 rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <ThumbsUp size={20} className="text-green-300" />
          <h3 className="font-semibold text-white">
            Tips for Better Responses
          </h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Clock size={16} className="text-green-300 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-green-200 mb-1">
                Be Patient
              </h4>
              <p className="text-xs text-green-300/80">
                Good answers take time. Most questions get answered within 24 hours.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <AlertCircle size={16} className="text-green-300 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-green-200 mb-1">
                Clarify When Needed
              </h4>
              <p className="text-xs text-green-300/80">
                Respond to comments asking for clarification to get better answers.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
          Community Stats
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">92%</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Questions answered</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">4.8</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Average response rating</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">15m</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Avg. first response time</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">45k</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Active developers</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SubmissionGuidelines;