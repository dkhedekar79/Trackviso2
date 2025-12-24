import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowLeft, Tag, User } from 'lucide-react';
import SEO from '../components/SEO';
import { getPostBySlug, getRelatedPosts } from '../data/blogPosts';

const BlogPost = () => {
  const { slug } = useParams();
  const post = getPostBySlug(slug);
  const relatedPosts = post ? getRelatedPosts(post) : [];

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 mt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Post Not Found</h1>
          <p className="text-purple-300 mb-6">The blog post you're looking for doesn't exist.</p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Generate structured data for the blog post
  const articleStructuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.description,
    "image": `https://trackviso-beta.vercel.app${post.featuredImage}`,
    "datePublished": post.publishDate,
    "dateModified": post.lastUpdated,
    "author": {
      "@type": "Person",
      "name": post.author,
      "description": post.authorBio
    },
    "publisher": {
      "@type": "Organization",
      "name": "Trackviso",
      "url": "https://trackviso-beta.vercel.app",
      "logo": {
        "@type": "ImageObject",
        "url": "https://trackviso-beta.vercel.app/og.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://trackviso-beta.vercel.app/blog/${post.slug}`
    },
    "articleSection": post.category,
    "keywords": post.keywords,
    "wordCount": post.content.split(' ').length,
    "timeRequired": `PT${post.readingTime}M`
  };

  return (
    <>
      <SEO
        title={post.title}
        description={post.description}
        url={`/blog/${post.slug}`}
        keywords={post.keywords}
        image={post.featuredImage}
        type="article"
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData) }}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 mt-20">
        <article className="max-w-4xl mx-auto px-6 py-12">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-purple-300 hover:text-purple-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Blog
            </Link>
          </motion.div>

          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="mb-4">
              <span className="px-4 py-2 bg-purple-600/30 text-purple-300 text-sm font-semibold rounded-full">
                {post.category}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              {post.title}
            </h1>
            <p className="text-xl text-purple-200 mb-6">
              {post.description}
            </p>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-purple-300/80 text-sm border-b border-purple-700/30 pb-6">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time dateTime={post.publishDate}>{formatDate(post.publishDate)}</time>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{post.readingTime} min read</span>
              </div>
            </div>
          </motion.header>

          {/* Featured Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8 rounded-2xl overflow-hidden"
          >
            <div className="relative h-64 bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Article Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="prose prose-invert prose-lg max-w-none mb-12"
          >
            <div
              className="text-white space-y-6"
              dangerouslySetInnerHTML={{ __html: post.content }}
              style={{
                '& h1': { color: '#fff', fontSize: '2.5rem', fontWeight: 'bold', marginTop: '2rem', marginBottom: '1rem' },
                '& h2': { color: '#fff', fontSize: '2rem', fontWeight: 'bold', marginTop: '1.5rem', marginBottom: '0.75rem' },
                '& h3': { color: '#e9d5ff', fontSize: '1.5rem', fontWeight: 'semibold', marginTop: '1.25rem', marginBottom: '0.5rem' },
                '& p': { color: '#d8b4fe', lineHeight: '1.75', marginBottom: '1rem' },
                '& ul, & ol': { color: '#d8b4fe', marginLeft: '1.5rem', marginBottom: '1rem' },
                '& li': { marginBottom: '0.5rem' },
                '& strong': { color: '#fff', fontWeight: 'bold' },
                '& a': { color: '#a78bfa', textDecoration: 'underline' }
              }}
            />
          </motion.div>

          {/* Tags */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Tags</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-purple-800/30 text-purple-300 rounded-lg text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12 pt-12 border-t border-purple-700/30"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    to={`/blog/${relatedPost.slug}`}
                    className="block p-6 bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-md rounded-xl border border-purple-700/30 hover:border-purple-500/50 transition-all group"
                  >
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                      {relatedPost.title}
                    </h3>
                    <p className="text-purple-200/80 text-sm line-clamp-2">
                      {relatedPost.description}
                    </p>
                    <div className="flex items-center gap-2 mt-4 text-purple-400 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{relatedPost.readingTime} min read</span>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.section>
          )}
        </article>
      </div>
    </>
  );
};

export default BlogPost;

