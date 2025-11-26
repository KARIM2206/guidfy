'use client';

import { Autoplay, Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Sarah L.',
      role: 'Front-End Developer',
      quote: 'Guidfy gave me the confidence and the portfolio I needed to land my dream job as a front-end developer. The guided paths were a game-changer!',
      avatar: {
        bg: 'bg-pink-100',
        emoji: '👩‍💻'
      }
    },
    {
      name: 'Michael B.',
      role: 'Full-Stack Engineer',
      quote: 'I went from a complete beginner to building complex applications. The community support and direct connections to companies were invaluable.',
      avatar: {
        bg: 'bg-amber-100',
        emoji: '👨‍💻'
      }
    },
    {
      name: 'Jessica T.',
      role: 'UI/UX Designer',
      quote: 'The project-based learning approach is fantastic. I built a portfolio that truly reflects my skills and got noticed by recruiters immediately.',
      avatar: {
        bg: 'bg-peach-100',
        emoji: '💁‍♀️'
      }
    },
    {
      name: 'David K.',
      role: 'Backend Developer',
      quote: 'The AI-guided learning path helped me focus on exactly what I needed to learn. Landed a job in 3 months!',
      avatar: {
        bg: 'bg-blue-100',
        emoji: '👨‍🎓'
      }
    },
    {
      name: 'Emily R.',
      role: 'Mobile Developer',
      quote: 'The community projects and mentorship program made all the difference. Highly recommended for career changers!',
      avatar: {
        bg: 'bg-purple-100',
        emoji: '👩‍🎨'
      }
    }
  ];

  return (
    <section className="w-full py-16 bg-gradient-to-b from-white to-blue-50 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="bg-blue-100/30 h-40 w-40 absolute top-20 right-10 rounded-full filter blur-xl animate-blob animation-delay-2000 opacity-50"></div>
        <div className="bg-cyan-100/20 h-40 w-40 absolute bottom-20 left-10 rounded-full filter blur-xl animate-blob animation-delay-3000 opacity-40"></div>
      </div>

      <div className="container mx-auto px-4">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Success Stories From Our Students
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover how our students transformed their careers with Guidfy's comprehensive learning platform.
          </p>
        </motion.div>

        {/* Swiper Slider */}
        <div className="relative max-w-6xl mx-auto">
          <Swiper
            spaceBetween={30}
            modules={[Navigation, Pagination, Autoplay, A11y]}
            slidesPerView={1}
            navigation={{
              nextEl: '.testimonial-next',
              prevEl: '.testimonial-prev',
            }}
            pagination={{ 
              clickable: true,
              el: '.testimonial-pagination',
              bulletClass: 'testimonial-bullet',
              bulletActiveClass: 'testimonial-bullet-active'
            }}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false
            }}
            breakpoints={{
              640: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 }
            }}
            className="pb-12 flex items-stretch"
          >
            {testimonials.map((testimonial, index) => (
              <SwiperSlide key={index}>
                <motion.div
                  whileHover={{ 
                    scale: 1.02,
                    y: -5
                  }}
                  className="h-full flex flex-col justify-between group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-white/20"
                >
                  <div className="flex flex-col items-center h-full text-center flex-1">
                    {/* Avatar */}
                    <div className="w-20 h-20 mx-auto mb-6">
                      <div className={`${testimonial.avatar.bg} w-full h-full rounded-full ring-4 ring-amber-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300`}>
                        {testimonial.avatar.emoji}
                      </div>
                    </div>

                    {/* Quote */}
                    <blockquote className="text-gray-700 text-base md:text-lg leading-relaxed italic mb-6 flex-1">
                      &ldquo;{testimonial.quote}&rdquo;
                    </blockquote>

                    {/* Name & Role */}
                    <div className="text-center">
                      <h4 className="font-semibold text-gray-900 text-lg mb-1">
                        {testimonial.name}
                      </h4>
                      <p className="text-gray-500 text-sm">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Buttons */}
          <button className="testimonial-prev absolute left-0 top-1/2 -translate-y-1/2 -left-4 z-10 bg-white/80 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white transition-all duration-300">
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <button className="testimonial-next absolute right-0 top-1/2 -translate-y-1/2 -right-4 z-10 bg-white/80 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white transition-all duration-300">
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>

          {/* Custom Pagination */}
          <div className="testimonial-pagination flex justify-center gap-2 mt-6"></div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(15px, -10px) scale(1.05); }
          66% { transform: translate(25px, 15px) scale(0.95); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 10s infinite ease-in-out;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-3000 {
          animation-delay: 3s;
        }

        /* Custom Pagination Styles */
        .testimonial-bullet {
          width: 10px;
          height: 10px;
          background: #cbd5e1;
          border-radius: 50%;
          margin: 0 4px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .testimonial-bullet-active {
          background: #3b82f6;
          transform: scale(1.2);
        }

        /* Navigation Buttons */
        .testimonial-prev:hover, .testimonial-next:hover {
          transform: scale(1.1);
        }

        /* Swiper Navigation Customization */
        .swiper-button-disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        /* Ensure consistent card heights */
        .swiper-slide {
          height: auto;
        }
      `}</style>
    </section>
  );
}