import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react';
import SEO from '../components/SEO';
import { getAllPosts } from '../data/blogPosts';
import AdSense from '../components/AdSense';

const Blog = () => {
  const posts = getAllPosts();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Generate structured data for blog listing
  const blogStructuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Trackviso Blog",
    "description": "Study tips, learning techniques, and academic success strategies from Trackviso",
    "url": "https://trackviso-beta.vercel.app/blog",
    "publisher": {
      "@type": "Organization",
      "name": "Trackviso",
      "url": "https://trackviso-beta.vercel.app"
    },
    "blogPost": posts.map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.description,
      "datePublished": post.publishDate,
      "dateModified": post.lastUpdated,
      "author": {
        "@type": "Person",
        "name": post.author
      },
      "url": `https://trackviso-beta.vercel.app/blog/${post.slug}`,
      "image": `https://trackviso-beta.vercel.app${post.featuredImage}`,
      "articleSection": post.category,
      "keywords": post.keywords
    }))
  };

  return (
    <>
      <SEO
        title="Study Tips & Learning Strategies Blog - Trackviso"
        description="Discover proven study techniques, learning strategies, and academic success tips. Learn about spaced repetition, active recall, and effective study habits."
        url="/blog"
        keywords="study tips, learning strategies, study methods, academic success, study techniques, exam preparation, study habits"
      />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogStructuredData) }}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent">
                Trackviso Blog
              </span>
            </h1>
            <p className="text-xl text-purple-200 max-w-2xl mx-auto">
              Study tips, learning techniques, and strategies to help you achieve academic excellence
            </p>
          </motion.div>

          {/* AdSense Ad - Blog Header */}
          <div className="mb-8">
            <AdSense format="horizontal" className="rounded-lg" />
          </div>

          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl overflow-hidden border border-purple-700/30 hover:border-purple-500/50 transition-all group"
              >
                <Link to={`/blog/${post.slug}`} className="block">
                  {/* Featured Image */}
                  <div className="relative h-48 bg-gradient-to-br from-purple-600/20 to-pink-600/20 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-purple-400/50" />
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-purple-600/80 backdrop-blur-sm text-white text-sm font-semibold rounded-full">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-purple-200/80 mb-4 line-clamp-3">
                      {post.description}
                    </p>

                    {/* Meta Information */}
                    <div className="flex items-center gap-4 text-sm text-purple-300/70 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(post.publishDate)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{post.readingTime} min read</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 bg-purple-800/30 text-purple-300 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Read More */}
                    <div className="flex items-center text-purple-400 font-semibold group-hover:text-purple-300 transition-colors">
                      Read more
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>

          {/* Empty State */}
          {posts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-purple-300 text-lg">No blog posts available yet.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Blog;

