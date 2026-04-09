import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "@/styles/style.scss";
import OverflowController from "../components/OverflowController";
import BodyFadeIn from "../components/BodyFadeIn";
import { getSiteSettings, getDefaultTitle, getDefaultDescription } from "../sanity/lib/siteSettings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

// Base URL for metadata (required for Open Graph/Twitter images and canonical URLs)
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
};

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  const siteTitle = getDefaultTitle(site);
  const siteDescription = getDefaultDescription(site);

  return {
    metadataBase: new URL(getBaseUrl()),
    title: siteTitle,
    description: siteDescription,
    authors: [{ name: siteTitle }],
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: siteTitle,
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script
          id="scroll-reset"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Reset scroll position immediately before anything else runs
              window.scrollTo(0, 0);
              // Disable scroll restoration to prevent browser from restoring scroll position
              if ('scrollRestoration' in history) {
                history.scrollRestoration = 'manual';
              }
              
              // Enable scrolling by default
              // This runs before React hydrates, so we suppress hydration warning on html tag
              document.documentElement.classList.add('scroll-enabled');
            `
          }}
        />
        <Script
          src="https://code.jquery.com/jquery-3.7.1.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-YS80YNZ2FX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-YS80YNZ2FX');
          `}
        </Script>
        <Script
          id="viewport-detection"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Function to wait for jQuery and initialize everything
                function initViewportDetection() {
                  // Check if jQuery is available
                  if (typeof window.jQuery === 'undefined' && typeof window.$ === 'undefined') {
                    // jQuery not ready yet, try again
                    setTimeout(initViewportDetection, 50);
                    return;
                  }
                  
                  var $ = window.jQuery || window.$;
                  
                  // Only define the plugin if it doesn't exist yet
                  if (!$.fn.inViewport) {
                    // The inViewport plugin code by Moob
                    (function ($) {
                      var vph=0;
                      function getViewportDimensions(){
                          vph = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
                      }
                      getViewportDimensions();    
                      $(window).on('resize orientationChanged', function(){
                          getViewportDimensions();
                      });            
                      
                      $.fn.inViewport = function (whenInView, whenNotInView) {                  
                          return this.each(function () {
                              var el = $(this),
                                  inviewalreadycalled = false,
                                  notinviewalreadycalled = false;                            
                              $(window).on('resize orientationChanged scroll', function(){
                                  checkInView();
                              });               
                              function checkInView(){
                                  var rect = el[0].getBoundingClientRect(),
                                      t = rect.top,
                                      b = rect.bottom;
                                  if(t<vph && b>0){
                                      if(!inviewalreadycalled){
                                          whenInView.call(el);
                                          inviewalreadycalled = true;
                                          notinviewalreadycalled = false;
                                      }
                                  } else {
                                      if(!notinviewalreadycalled){
                                          whenNotInView.call(el);
                                          notinviewalreadycalled = true;
                                          inviewalreadycalled = false;
                                      }
                                  }
                              }
                              checkInView();                
                          });
                      }             
                    }(jQuery));
                  }
                  
                  // Initialize the viewport detection
                  function outOfView() {
                    if (!$ || !$.fn.inViewport) return;
                    $('.out-of-view').inViewport(
                      function(){
                        $(this).addClass("am-in-view in-view-detect");
                      },
                      function(){
                        $(this).removeClass("in-view-detect");
                      }
                    );
                  }
                  
                  function outOfOpacity() {
                    if (!$ || !$.fn.inViewport) return;
                    $('.out-of-opacity').inViewport(
                      function(){
                        $(this).addClass("am-in-view in-view-detect");
                      },
                      function(){
                        $(this).removeClass("in-view-detect");
                      }
                    );
                  }
                  
                  // Run when DOM is ready
                  $(document).ready(function() {
                    outOfView();
                    outOfOpacity();
                  });
                  
                  // Re-run on browser navigation (back/forward)
                  window.addEventListener('popstate', function() {
                    setTimeout(function() {
                      outOfView();
                      outOfOpacity();
                    }, 100);
                  });
                  
                  // Re-run on Next.js route changes
                  // Use MutationObserver to detect DOM changes
                  const observer = new MutationObserver(function(mutations) {
                    let shouldReRun = false;
                    mutations.forEach(function(mutation) {
                      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        // Check if any added nodes contain elements with our classes
                        mutation.addedNodes.forEach(function(node) {
                          if (node.nodeType === 1) { // Element node
                            if (node.classList && (node.classList.contains('out-of-view') || node.classList.contains('out-of-opacity'))) {
                              shouldReRun = true;
                            }
                            // Also check child elements
                            if (node.querySelector && (node.querySelector('.out-of-view') || node.querySelector('.out-of-opacity'))) {
                              shouldReRun = true;
                            }
                          }
                        });
                      }
                    });
                    
                    if (shouldReRun) {
                      setTimeout(function() {
                        outOfView();
                        outOfOpacity();
                      }, 100);
                    }
                  });
                  
                  // Start observing
                  if (document.body) {
                    observer.observe(document.body, {
                      childList: true,
                      subtree: true
                    });
                  }
                  
                  // Smooth scroll functionality for hash links with header offset
                  function getHeaderHeight() {
                    var header = document.querySelector('.site-header');
                    return header ? header.offsetHeight : 0;
                  }
                  
                  function smoothScrollToElementWithOffset(el) {
                    if (!el) return;
                    var rect = el.getBoundingClientRect();
                    var headerHeight = getHeaderHeight();
                    var targetY = window.scrollY + rect.top - headerHeight;
                    if (targetY < 0) targetY = 0;
                    window.scrollTo({ top: targetY, behavior: 'smooth' });
                  }
                  
                  function initSmoothScroll() {
                    // Handle initial page load with hash
                    if (window.location.hash) {
                      setTimeout(function() {
                        var target = document.querySelector(window.location.hash);
                        if (target) {
                          smoothScrollToElementWithOffset(target);
                        }
                      }, 100);
                    }
                    
                    // Handle clicks on links with hash
                    $(document).on('click', 'a[href*="#"]', function(e) {
                      var href = $(this).attr('href');
                      if (href && href.includes('#')) {
                        var hash = href.split('#')[1];
                        if (!hash) return; // ignore links that are just '#'
                        var target = document.getElementById(hash) || document.querySelector('a[name="' + hash + '"]');
                        
                        if (target) {
                          e.preventDefault();
                          smoothScrollToElementWithOffset(target);
                          
                          // Update URL without triggering scroll
                          history.pushState(null, '', href);
                        }
                      }
                    });
                    
                    // Handle browser back/forward with hash
                    window.addEventListener('popstate', function() {
                      if (window.location.hash) {
                        setTimeout(function() {
                          var target = document.querySelector(window.location.hash);
                          if (target) {
                            smoothScrollToElementWithOffset(target);
                          }
                        }, 100);
                      }
                    });
                  }
                  
                  // Initialize smooth scroll
                  initSmoothScroll();
                }
                
                // Start initialization
                initViewportDetection();
              })();
            `
          }}
        />
        <BodyFadeIn />
        <OverflowController />
        {children}
      </body>
    </html>
  );
}
