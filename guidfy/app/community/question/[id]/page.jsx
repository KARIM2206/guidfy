// app/question/[id]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import QuestionHeader from '../../../components/community/question/QuestionHeader';
import QuestionBody from '../../../components/community/question/QuestionBody';
import QuestionTags from '../../../components/community/question/QuestionTags';
import QuestionActions from '../../../components/community/question/QuestionActions';
import AnswerList from '../../../components/community/question/AnswerList';
import AnswerForm from '../../../components/community/question/AnswerForm';
import CommentList from '../../../components/community/question/CommentList';
import CommentForm from '../../../components/community/question/CommentForm';
import CodeBlock from '../../../components/ui/CodeBlock';
import SidebarPanel from '../../../components/community/question/SidebarPanel';
import { 
  ArrowLeft, 
  Share2, 
  Bookmark, 
  Flag, 
  Eye,
  Clock,
  MessageSquare,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

// Mock data
const mockQuestion = {
  id: 'q123',
  title: 'How to optimize React re-renders with useMemo and useCallback in large applications?',
  author: {
    name: 'Sarah Johnson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    reputation: 12450,
    badges: ['gold', 'silver', 'bronze']
  },
  createdAt: '2 hours ago',
  updatedAt: '30 minutes ago',
  views: 2450,
  votes: 124,
  isBookmarked: false,
  isUpvoted: false,
  isDownvoted: false,
  tags: ['react', 'performance', 'hooks', 'optimization', 'typescript'],
  content: `
I'm working on a large-scale React application with hundreds of components. The application is starting to suffer from performance issues due to unnecessary re-renders. 

I understand the basic concepts of \`useMemo\` and \`useCallback\`, but I'm struggling with when to use them effectively in a complex codebase.

**Current Issues:**
1. Child components re-rendering when parent state changes unnecessarily
2. Expensive calculations running on every render
3. Event handlers causing re-renders in memoized components

**Example Code:**

\`\`\`jsx
// Current implementation causing issues
function UserDashboard({ users, filters }) {
  const [selectedUser, setSelectedUser] = useState(null);
  
  const filteredUsers = users.filter(user => {
    // Expensive calculation running on every render
    return userMatchesFilters(user, filters);
  });
  
  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };
  
  return (
    <div>
      <UserList 
        users={filteredUsers} 
        onSelect={handleUserSelect}
      />
      <UserDetails user={selectedUser} />
    </div>
  );
}
\`\`\`

**Questions:**
1. When should I use \`useMemo\` vs \`useCallback\`?
2. Are there any performance overheads to overusing these hooks?
3. Best practices for TypeScript with these hooks?
4. How to debug unnecessary re-renders effectively?

Any real-world examples or performance benchmarks would be greatly appreciated!
`,
  comments: [
    {
      id: 'c1',
      author: 'Mike Wilson',
      content: 'Great question! Have you tried using the React DevTools Profiler?',
      createdAt: '1 hour ago',
      votes: 15
    },
    {
      id: 'c2',
      author: 'Alex Chen',
      content: 'Also check out the React.memo HOC for preventing re-renders.',
      createdAt: '45 minutes ago',
      votes: 8
    }
  ],
  answers: [
    {
      id: 'a1',
      author: {
        name: 'React Performance Expert',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Expert',
        reputation: 24560,
        badges: ['gold', 'platinum']
      },
      content: `
This is a common issue in large React applications. Here's a comprehensive approach:

## 1. When to use useMemo

Use \`useMemo\` when:
- Computing expensive values
- Preventing unnecessary calculations
- Memoizing values passed as props to memoized components

**Optimized Example:**

\`\`\`jsx
function UserDashboard({ users, filters }) {
  const [selectedUser, setSelectedUser] = useState(null);
  
  const filteredUsers = useMemo(() => {
    return users.filter(user => userMatchesFilters(user, filters));
  }, [users, filters]); // Only recalculates when dependencies change
  
  // Rest of the component...
}
\`\`\`

## 2. When to use useCallback

Use \`useCallback\` when:
- Passing functions as props to memoized components
- Functions are dependencies in other hooks
- Preventing function recreation on every render

**Optimized Example:**

\`\`\`jsx
const handleUserSelect = useCallback((user) => {
  setSelectedUser(user);
}, []); // Empty dependency array = function never changes
\`\`\`

## 3. Performance Overheads

Yes, there are overheads:
- Memory usage increases
- Hook execution time
- Dependency comparison cost

**Rule of thumb:** Only use when you can measure performance improvements.

## 4. Debugging Tools

1. React DevTools Profiler
2. Why Did You Render library
3. Chrome Performance Tab
4. Custom \`useWhyDidYouUpdate\` hook

\`\`\`jsx
// Custom debug hook
function useWhyDidYouUpdate(name, props) {
  const previousProps = useRef();
  
  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changes = {};
      
      allKeys.forEach(key => {
        if (previousProps.current[key] !== props[key]) {
          changes[key] = {
            from: previousProps.current[key],
            to: props[key]
          };
        }
      });
      
      if (Object.keys(changes).length) {
        console.log('[why-did-you-update]', name, changes);
      }
    }
    
    previousProps.current = props;
  });
}
\`\`\`

## 5. TypeScript Best Practices

\`\`\`typescript
// Explicitly type dependencies
const filteredUsers = useMemo<User[]>(() => {
  return users.filter(user => userMatchesFilters(user, filters));
}, [users, filters]);

// Use generic types for useCallback
const handleSelect = useCallback<(user: User) => void>(
  (user) => setSelectedUser(user),
  []
);
\`\`\`
`,
      createdAt: '1 hour ago',
      votes: 89,
      isAccepted: true,
      comments: [
        {
          id: 'ac1',
          author: 'Original Poster',
          content: 'This is extremely helpful! The TypeScript examples are exactly what I needed.',
          createdAt: '30 minutes ago',
          votes: 12
        }
      ]
    },
    {
      id: 'a2',
      author: {
        name: 'Senior Frontend Dev',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Senior',
        reputation: 15670,
        badges: ['gold', 'silver']
      },
      content: `
Adding to the excellent answer above:

## Real-world Benchmark

I ran benchmarks on our production app (10k+ components):

**Before optimization:**
- Average render time: 45ms
- Unnecessary re-renders: 68%
- Memory usage: 1.2GB

**After optimization:**
- Average render time: 18ms
- Unnecessary re-renders: 12%
- Memory usage: 1.5GB

## Additional Tips:

1. **Combine with React.memo:**
\`\`\`jsx
const UserList = React.memo(function UserList({ users, onSelect }) {
  // Component implementation
});
\`\`\`

2. **Use useReducer for complex state:**
\`\`\`jsx
const [state, dispatch] = useReducer(userReducer, initialState);
// More stable than multiple useState calls
\`\`\`

3. **Lazy load components:**
\`\`\`jsx
const UserDetails = React.lazy(() => import('./UserDetails'));
\`\`\`

4. **Virtualize long lists:**
\`\`\`jsx
import { FixedSizeList } from 'react-window';
\`\`\`
`,
      createdAt: '45 minutes ago',
      votes: 42,
      isAccepted: false,
      comments: []
    }
  ]
};

 const QuestionDetailPage=()=> {
  const params = useParams();
  const id = params.id;
  
  const [question, setQuestion] = useState(mockQuestion);
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Simulate API call
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, [id]);

  const handleVote = (type) => {
    setQuestion(prev => ({
      ...prev,
      votes: type === 'up' ? prev.votes + 1 : prev.votes - 1,
      isUpvoted: type === 'up' ? !prev.isUpvoted : false,
      isDownvoted: type === 'down' ? !prev.isDownvoted : false
    }));
  };

  const handleBookmark = () => {
    setQuestion(prev => ({
      ...prev,
      isBookmarked: !prev.isBookmarked
    }));
  };

  const handleAcceptAnswer = (answerId) => {
    setQuestion(prev => ({
      ...prev,
      answers: prev.answers.map(answer => ({
        ...answer,
        isAccepted: answer.id === answerId
      }))
    }));
  };

  const handleSubmitAnswer = (content) => {
    const newAnswer = {
      id: `a${Date.now()}`,
      author: {
        name: 'Current User',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Current',
        reputation: 850,
        badges: ['bronze']
      },
      content,
      createdAt: 'Just now',
      votes: 0,
      isAccepted: false,
      comments: []
    };

    setQuestion(prev => ({
      ...prev,
      answers: [...prev.answers, newAnswer]
    }));
    setShowAnswerForm(false);
  };

  const handleAddComment = (comment, targetId, type) => {
    if (type === 'question') {
      setQuestion(prev => ({
        ...prev,
        comments: [...prev.comments, {
          id: `c${Date.now()}`,
          author: { name: 'Current User' },
          content: comment,
          createdAt: 'Just now',
          votes: 0
        }]
      }));
    } else {
      setQuestion(prev => ({
        ...prev,
        answers: prev.answers.map(answer => 
          answer.id === targetId ? {
            ...answer,
            comments: [...answer.comments, {
              id: `ac${Date.now()}`,
              author: { name: 'Current User' },
              content: comment,
              createdAt: 'Just now',
              votes: 0
            }]
          } : answer
        )
      }));
    }
    setActiveCommentId(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            {/* Skeleton loader */}
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Back Navigation */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 mb-6 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to questions</span>
        </motion.button>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Question Header */}
            <QuestionHeader
              title={question.title}
              author={question.author}
              createdAt={question.createdAt}
              updatedAt={question.updatedAt}
              views={question.views}
            />

            {/* Question Stats Bar */}
            <div className="flex items-center gap-6 mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Eye size={16} />
                <span className="text-sm font-medium">{question.views.toLocaleString()} views</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Clock size={16} />
                <span className="text-sm">Asked {question.createdAt}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <MessageSquare size={16} />
                <span className="text-sm">{question.answers.length} answers</span>
              </div>
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <TrendingUp size={16} />
                <span className="text-sm">{question.votes} votes</span>
              </div>
            </div>

            {/* Question Content */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-8">
              <div className="flex">
                {/* Sticky Vote Sidebar */}
                <div className="hidden md:flex flex-col items-center p-4 border-r border-gray-200 dark:border-gray-700">
                  <QuestionActions
                    votes={question.votes}
                    isUpvoted={question.isUpvoted}
                    isDownvoted={question.isDownvoted}
                    isBookmarked={question.isBookmarked}
                    onVote={handleVote}
                    onBookmark={handleBookmark}
                    onShare={() => console.log('Share')}
                    onReport={() => console.log('Report')}
                  />
                </div>

                {/* Question Body */}
                <div className="flex-1 p-6">
                  <QuestionBody content={question.content} />
                  
                  {/* Question Tags */}
                  <div className="mt-8">
                    <QuestionTags tags={question.tags} />
                  </div>

                  {/* Question Actions (Mobile) */}
                  <div className="md:hidden mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <QuestionActions
                      votes={question.votes}
                      isUpvoted={question.isUpvoted}
                      isDownvoted={question.isDownvoted}
                      isBookmarked={question.isBookmarked}
                      onVote={handleVote}
                      onBookmark={handleBookmark}
                      onShare={() => console.log('Share')}
                      onReport={() => console.log('Report')}
                    />
                  </div>

                  {/* Question Comments */}
                  <div className="mt-8">
                    <CommentList
                      comments={question.comments}
                      onAddComment={() => setActiveCommentId('question')}
                    />
                    {activeCommentId === 'question' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <CommentForm
                          onSubmit={(comment) => handleAddComment(comment, 'question', 'question')}
                          onCancel={() => setActiveCommentId(null)}
                          placeholder="Add a comment to the question..."
                        />
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Answers Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {question.answers.length} {question.answers.length === 1 ? 'Answer' : 'Answers'}
                </h2>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Sorted by: <span className="font-medium text-gray-700 dark:text-gray-300">Most votes</span>
                  </span>
                  <button
                    onClick={() => setShowAnswerForm(true)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Post Your Answer
                  </button>
                </div>
              </div>

              <AnswerList
                answers={question.answers}
                onAcceptAnswer={handleAcceptAnswer}
                onAddComment={(answerId) => setActiveCommentId(answerId)}
              />

              {/* Answer Form */}
              <AnimatePresence>
                {showAnswerForm && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <AnswerForm
                      onSubmit={handleSubmitAnswer}
                      onCancel={() => setShowAnswerForm(false)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Answer Comment Forms */}
              <AnimatePresence>
                {question.answers.map(answer => (
                  activeCommentId === answer.id && (
                    <motion.div
                      key={`comment-form-${answer.id}`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4"
                    >
                      <CommentForm
                        onSubmit={(comment) => handleAddComment(comment, answer.id, 'answer')}
                        onCancel={() => setActiveCommentId(null)}
                        placeholder="Add a comment to this answer..."
                      />
                    </motion.div>
                  )
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80">
            <SidebarPanel question={question} />
          </div>
        </div>
      </div>
    </div>
  );
}
export default QuestionDetailPage