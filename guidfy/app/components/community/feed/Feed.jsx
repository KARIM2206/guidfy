// components/feed/Feed.jsx - النسخة المحدثة
'use client';
import { motion, AnimatePresence } from 'framer-motion';
import QuestionCard from './QuestionCard';
import PostCard from './PostCard';
import ProjectCard from './ProjectCard';
import { useState } from 'react';
import CreateModal from './CreateModal';
import { useCommunity } from '@/app/CONTEXT/CommuntiyProvider';

const Feed = ({ items = [], onLoadMore, hasMore = false , isLoadingMore = false, communityId}) => {
  const{isCode}=useCommunity()
  if (items.length === 0) return null;

const[isModalOpen, setIsModalOpen] = useState(false);
  const renderItem = (item) => {
    switch (item.type) {
      case 'question':
        return (
          <QuestionCard
            key={item.id}
            id={item.id}
            title={item.title}
            excerpt={item.excerpt}
            tags={item.tags}
            author={item.author || item.author.name}
            votes={item.votes}
            answers={item.answers}
            views={item.views}
            isAnswered={item.isAnswered}
            createdAt={item.createdAt}
            community={item.community}
            isCode={isCode}
            body={item.body}
            authorAvatar={item.authorAvatar}
          />
        );
      case 'post':
        return (
          <PostCard
            key={item.id}
            id={item.id}
            title={item.title}
            excerpt={item.excerpt}
            image={item.image}
            tags={item.tags}
            author={item.author || item.author.name}
            likes={item.likes}
            comments={item.comments}
            bookmarks={item.bookmarks}
            views={item.views}
            readTime={item.readTime}
            isTrending={item.isTrending}
            createdAt={item.createdAt}
            community={item.community}
            authorAvatar={item.authorAvatar}
          />
        );
      case 'project':
        return (
          <ProjectCard
            key={item.id}
            id={item.id}
            title={item.title}
            description={item.description}
            techStack={item.techStack}
            stars={item.stars}
            forks={item.forks}
            watchers={item.watchers}
            contributors={item.contributors}
            lastUpdated={item.lastUpdated}
            isFeatured={item.isFeatured}
            demoUrl={item.demoUrl}
            repoUrl={item.repoUrl}
            community={item.community}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
           <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Create
        </motion.button>
      </div>
      <AnimatePresence>
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            {renderItem(item)}
          </motion.div>
        ))}
      </AnimatePresence>

      {hasMore && (
        <div className="flex justify-center pt-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLoadMore}
            className="px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
          >
            Load More
          </motion.button>
        </div>
      )}
      <CreateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} communityId={communityId} />
    </div>
  );
};

export default Feed;