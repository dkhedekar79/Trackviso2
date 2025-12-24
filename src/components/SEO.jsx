import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title = "Trackviso — Gamified Study Tracker", 
  description = "Trackviso is a progress tracking app that turns your studying into a game with streaks, quests, and insights to keep you consistent.",
  image = "https://trackviso.vercel.app/og.png",
  url = "https://trackviso.vercel.app",
  type = "website",
  keywords = "study tracker, gamified learning, study app, academic tracker, study productivity, study streaks, study quests, AI study tutor, revision tracker, study analytics",
  robots = "index, follow",
  noindex = false
}) => {
  const fullTitle = title.includes('Trackviso') ? title : `${title} | Trackviso`;
  const baseUrl = "https://trackviso.vercel.app";
  const cleanUrl = url === "/" ? "" : url;
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${cleanUrl}`;
  const fullImage = image.startsWith('http') ? image : `${baseUrl}${image.startsWith('/') ? image : `/${image}`}`;
  
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={fullUrl} />
      <meta name="robots" content={noindex ? "noindex, nofollow" : robots} />
      <meta name="language" content="English" />
      <meta name="author" content="Trackviso" />
      <meta name="revisit-after" content="7 days" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:site_name" content="Trackviso" />
      <meta property="og:locale" content="en_GB" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:image:alt" content={title} />

      {/* Additional SEO */}
      <meta name="theme-color" content="#0ea5e9" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

      {/* Article-specific meta tags */}
      {type === "article" && (
        <>
          <meta property="article:published_time" content={new Date().toISOString()} />
          <meta property="article:modified_time" content={new Date().toISOString()} />
          <meta property="article:author" content="Trackviso Team" />
          <meta property="article:section" content="Education" />
        </>
      )}
    </Helmet>
  );
};

export default SEO;

