'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { PortableText } from '@portabletext/react'
import Logo from './Logo'
import type { Footer } from '../types/footerSettings'
import StackedLogo from './StackedLogo'
import { portableTextComponents } from '../utils/portableTextComponents'
import { getLinkInfo } from '../utils/getLinkInfo'
import { getExternalLinkProps } from '../utils/getExternalLinkProps'

const FooterLottieAnimation = dynamic(
  () => import('./FooterLottieAnimation'),
  { ssr: false }
)

interface FooterProps {
  footer: Footer
}

export default function Footer({ footer }: FooterProps) {
  const footerRef = useRef<HTMLElement>(null)
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false)

  const renderFooterLinks = (links?: Footer['column2']) =>
    links?.map((link, index) => {
      const { href, text: label } = getLinkInfo(link)

      // Skip rendering if href is undefined
      if (!href) return null

      return (
        <div key={index} className="underline-link cream uppercase cta-font">
          <Link
            href={href}
            {...getExternalLinkProps(link.linkType)}
          >
            {label}
          </Link>
        </div>
      )
    })

  const handleNewsletterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    setNewsletterSubmitted(true)
    form.target = 'mc_embed_signup_iframe'
    form.submit()
  }

  useEffect(() => {
    // Add Mailchimp CSS if not already added
    if (!document.querySelector('link[href*="mailchimp.com/embedcode"]')) {
      const link = document.createElement('link')
      link.href = '//cdn-images.mailchimp.com/embedcode/classic-061523.css'
      link.rel = 'stylesheet'
      link.type = 'text/css'
      document.head.appendChild(link)
    }
  }, [])

  return (
    <footer ref={footerRef} className="site-footer h-pad">
      <div className="top-row row-lg">
        <div className="column-1 col-3-12_lg">
          {footer.column1 && footer.column1.map((item, index) => (
            <div key={index}>
              {item.heading && (
                <div className="cta-font heading">{item.heading}</div>
              )}
              {item.text && (
                <div>
                  <PortableText value={item.text} components={portableTextComponents} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="column-2 col-2-12_lg">
          <div className="nav-wrap">
            {renderFooterLinks(footer.column2)}
          </div>
        </div>

        <div className="column-3 col-2-12_lg">
          <div className="nav-wrap">
            {renderFooterLinks(footer.column3)}
          </div>
        </div>

        <div className="col-2-12_lg dummy-col"></div>
        
        <div className="column-4 col-3-12_lg">
          <div id="mc_embed_shell_desktop">
            <div id="mc_embed_signup_desktop">
              <div className={`newsletter-signup-content ${newsletterSubmitted ? 'newsletter-signup-content--faded' : ''}`}>
                {footer.newsletterText && (
                  <div className="newsletter-text cta-font">
                    <PortableText value={footer.newsletterText} components={portableTextComponents} />
                  </div>
                )}

                <form onSubmit={handleNewsletterSubmit} action="https://bmvillage.us4.list-manage.com/subscribe/post?u=b09c67fbb5b3ce6ee63196093&amp;id=4824c65abe&amp;f_id=00de6ceaf0" method="post" id="mc-embedded-subscribe-form-desktop" name="mc-embedded-subscribe-form-desktop" className="validate" noValidate>
                  <div id="mc_embed_signup_scroll_desktop">
                    <div className="mc-field-group">
                      <div className="input-wrap">
                        <input type="email" name="EMAIL" className="required email" id="mce-EMAIL-desktop" placeholder="Email Address" required defaultValue="" />
                        <button type="submit" name="subscribe" id="mc-embedded-subscribe-desktop" className="button" aria-label="Subscribe">
                          <svg xmlns="http://www.w3.org/2000/svg" width="7" height="12" viewBox="0 0 7 12">
                            <path d="M0.353516 0.353516L5.85352 5.85352L0.353516 11.3535"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div id="mce-responses-desktop" className="clear foot">
                      <div className="response" id="mce-error-response-desktop" style={{ display: 'none' }}></div>
                      <div className="response" id="mce-success-response-desktop" style={{ display: 'none' }}></div>
                    </div>
                    <div aria-hidden="true" style={{ position: 'absolute', left: '-5000px' }}>
                      <input type="text" name="b_b09c67fbb5b3ce6ee63196093_4824c65abe" tabIndex={-1} readOnly />
                    </div>
                  </div>
                </form>

                <p>By signing up, you are agreeing to our <Link href="/privacy-policy">privacy policy</Link></p>
              </div>

              {newsletterSubmitted && (
                <p className="newsletter-thank-you cta-font">Thank you for subscribing.</p>
              )}
              <iframe
                name="mc_embed_signup_iframe"
                title="Newsletter signup"
                className="newsletter-signup-iframe"
                tabIndex={-1}
              />
            </div>
          </div>

          <FooterLottieAnimation footerRef={footerRef} />
        </div>

        <FooterLottieAnimation footerRef={footerRef} />
      </div>

      <div className="logo desktop">
        <Logo />
      </div>

      <div className="logo mobile">
        <StackedLogo />
      </div>
    </footer>
  )
}
