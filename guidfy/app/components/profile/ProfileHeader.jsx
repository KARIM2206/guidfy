// components/profile/ProfileHeader.jsx
import { motion } from 'framer-motion';
import { MapPin, Calendar, Globe, Github, Twitter, Linkedin, Mail } from 'lucide-react';

const ProfileHeader = ({
  name,
  title,
  bio,
  avatar,
  cover,
  location,
  joinDate,
  website,
  github,
  twitter,
  linkedin
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      {/* Cover Image */}
      <div className="h-48 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative">
        {cover && (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${cover})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Edit Cover Button */}
        <button className="absolute top-4 right-4 px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-lg hover:bg-white/30 transition-colors">
          Edit Cover
        </button>
      </div>
      
      {/* Profile Info */}
      <div className="px-6 pb-6 -mt-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          {/* Avatar & Name */}
          <div className="flex items-end gap-6">
            <div className="relative">
              <div className="h-32 w-32 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-1.5">
                <div className="h-full w-full rounded-2xl bg-white dark:bg-gray-900 p-1.5">
                  <div 
                    className="h-full w-full rounded-2xl bg-gray-200 dark:bg-gray-700"
                    style={{
                      backgroundImage: `url(${avatar})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                </div>
              </div>
              
              {/* Online Status */}
              <div className="absolute bottom-3 right-3 h-5 w-5 bg-green-500 rounded-full border-3 border-white dark:border-gray-800"></div>
            </div>
            
            <div className="pb-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{name}</h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">{title}</p>
              
              {/* Stats */}
              <div className="flex items-center gap-6 mt-4">
                {location && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin size={16} />
                    <span className="text-sm">{location}</span>
                  </div>
                )}
                
                {joinDate && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar size={16} />
                    <span className="text-sm">Joined {joinDate}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow">
              Follow
            </button>
            <button className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors">
              Message
            </button>
          </div>
        </div>
        
        {/* Bio */}
        <div className="mt-6">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{bio}</p>
        </div>
        
        {/* Social Links */}
        <div className="flex flex-wrap items-center gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          {website && (
            <a 
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Globe size={16} />
              <span className="text-sm">Website</span>
            </a>
          )}
          
          {github && (
            <a 
              href={`https://github.com/${github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 transition-colors"
            >
              <Github size={16} />
              <span className="text-sm">GitHub</span>
            </a>
          )}
          
          {twitter && (
            <a 
              href={`https://twitter.com/${twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            >
              <Twitter size={16} />
              <span className="text-sm">Twitter</span>
            </a>
          )}
          
          {linkedin && (
            <a 
              href={`https://linkedin.com/in/${linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-500 transition-colors"
            >
              <Linkedin size={16} />
              <span className="text-sm">LinkedIn</span>
            </a>
          )}
          
          <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 transition-colors ml-auto">
            <Mail size={16} />
            <span className="text-sm">Contact</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileHeader;