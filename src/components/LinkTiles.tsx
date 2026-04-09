/* eslint-disable @next/next/no-img-element */

import React from 'react'
import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { SanityImage, SanityVideo } from '../types/sanity'
import { videoUrlFor } from '@/sanity/utils/videoUrlBuilder'
import { getLinkInfo } from '../utils/getLinkInfo'
import { getExternalLinkProps } from '../utils/getExternalLinkProps'
import type { CtaLink } from '../types/link'

type LinkTile = {
  mediaType?: 'image' | 'video'
  image?: SanityImage
  video?: SanityVideo
  videoSource?: 'file' | 'url'
  videoUrl?: string
  cta?: CtaLink
}

type LinkTilesProps = {
  numberOfTiles?: number
  linkTile1?: LinkTile
  linkTile2?: LinkTile
  linkTile3?: LinkTile
  linkTile4?: LinkTile
  linkTile5?: LinkTile
  linkTile6?: LinkTile
  linkTile7?: LinkTile
}

// Helper function to get layout classes based on number of tiles
const getLayoutClasses = (numberOfTiles: number, tileIndex: number): string => {
  switch (numberOfTiles) {
    case 2:
      return tileIndex === 0 ? 'col-6-12_lg' : 'col-4-12_lg'
    case 3:
      return tileIndex === 0 ? 'col-5-12_lg' : tileIndex === 1 ? 'col-3-12_lg' : 'col-2-12_lg'
    case 4:
      return tileIndex === 0 ? 'col-2-12_lg' : tileIndex === 1 ? 'col-3-12_lg' : tileIndex === 2 ? 'col-3-12_lg' : 'col-5-12_lg'
    case 5:
      return tileIndex === 0 ? 'col-2-12_lg' : tileIndex === 1 ? 'col-3-12_lg' : tileIndex === 2 ? 'col-3-12_lg' : tileIndex === 3 ? 'col-4-12_lg' : 'col-5-12_lg'
    case 6:
      return tileIndex === 0 ? 'col-2-12_lg' : tileIndex === 1 ? 'col-3-12_lg' : tileIndex === 2 ? 'col-3-12_lg' : tileIndex === 3 ? 'col-4-12_lg' : tileIndex === 4 ? 'col-5-12_lg' : 'col-4-12_lg'
    case 7:
      return tileIndex === 0 ? 'col-2-12_lg' : tileIndex === 1 ? 'col-3-12_lg' : tileIndex === 2 ? 'col-3-12_lg' : tileIndex === 3 ? 'col-4-12_lg' : tileIndex === 4 ? 'col-5-12_lg' : tileIndex === 5 ? 'col-3-12_lg' : 'col-4-12_lg'
    default:
      return 'col-4-12_lg'
  }
}

// Helper function to render a single tile
const renderTile = (tile: LinkTile, tileIndex: number, numberOfTiles: number) => {
  if (!tile) return null

  const layoutClass = getLayoutClasses(numberOfTiles, tileIndex)
  const tileNumberClass = `tile-${tileIndex + 1}`
  const { text, href } = getLinkInfo(tile.cta)
  
  return (
    <div key={tileIndex} className={`${layoutClass} ${tileNumberClass} tile relative out-of-opacity`}>
      {tile.mediaType === 'image' && tile.image && (
        <div className="fill-space-image-wrap">
          <img 
            data-src={urlFor(tile.image).url()}
            alt={tile.image?.alt ?? ''}
            className="lazy full-bleed-image"
            style={{
              objectPosition: tile.image?.hotspot
                ? `${tile.image.hotspot.x * 100}% ${tile.image.hotspot.y * 100}%`
                : "center",
            }}
          />
          <div className="loading-overlay" />
        </div>
      )}

      {tile.mediaType === 'video' && (tile.video || tile.videoUrl) && (
        <div className="fill-space-video-wrap">
          <video
            src={tile.videoSource === 'url' && tile.videoUrl ? tile.videoUrl : videoUrlFor(tile.video)}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        </div>
      )}

      <div className="opacity-overlay" />

      <div className="link-text">
        <h2>{text}</h2>
      </div>

      {href && <a href={href} {...getExternalLinkProps(tile.cta?.linkType)}></a>}
    </div>
  )
}

export default function LinkTiles({ 
  numberOfTiles = 3, 
  linkTile1, 
  linkTile2, 
  linkTile3, 
  linkTile4, 
  linkTile5, 
  linkTile6, 
  linkTile7 
}: LinkTilesProps) {
  const tiles = [linkTile1, linkTile2, linkTile3, linkTile4, linkTile5, linkTile6, linkTile7]
  const activeTiles = tiles.slice(0, numberOfTiles).filter(Boolean)

  // Render specific layouts based on numberOfTiles
  const renderDesktopLayout = () => {
    switch (numberOfTiles) {
      case 2:
        return (
          <div className="row-lg">
            {activeTiles[0] && renderTile(activeTiles[0], 0, numberOfTiles)}
            <div className="col-1-12_lg"></div>
            {activeTiles[1] && renderTile(activeTiles[1], 1, numberOfTiles)}
            <div className="col-1-12_lg"></div>
          </div>
        )
      
      case 3:
        return (
          <div className="row-lg">
            {activeTiles[0] && renderTile(activeTiles[0], 0, numberOfTiles)}
            <div className="col-1-12_lg"></div>
            {activeTiles[1] && renderTile(activeTiles[1], 1, numberOfTiles)}
            <div className="col-1-12_lg"></div>
            {activeTiles[2] && renderTile(activeTiles[2], 2, numberOfTiles)}
          </div>
        )
      
      case 4:
        return (
          <>
            <div className="row-1 row-lg">
              {activeTiles[0] && renderTile(activeTiles[0], 0, numberOfTiles)}
              <div className="col-1-12_lg"></div>
              {activeTiles[1] && renderTile(activeTiles[1], 1, numberOfTiles)}
              <div className="col-2-12_lg"></div>
              {activeTiles[2] && renderTile(activeTiles[2], 2, numberOfTiles)}
              <div className="col-1-12_lg"></div>
            </div>
            <div className="row-2 row-lg">
              <div className="col-7-12_lg"></div>
              {activeTiles[3] && renderTile(activeTiles[3], 3, numberOfTiles)}
            </div>
          </>
        )
      
      case 5:
        return (
          <>
            <div className="row-1 row-lg">
              {activeTiles[0] && renderTile(activeTiles[0], 0, numberOfTiles)}
              <div className="col-1-12_lg"></div>
              {activeTiles[1] && renderTile(activeTiles[1], 1, numberOfTiles)}
              <div className="col-2-12_lg"></div>
              {activeTiles[2] && renderTile(activeTiles[2], 2, numberOfTiles)}
              <div className="col-1-12_lg"></div>
            </div>
            <div className="row-2 row-lg">
              <div className="col-1-12_lg"></div>
              {activeTiles[3] && renderTile(activeTiles[3], 3, numberOfTiles)}
              <div className="col-2-12_lg"></div>
              {activeTiles[4] && renderTile(activeTiles[4], 4, numberOfTiles)}
            </div>
          </>
        )
      
      case 6:
        return (
          <>
            <div className="row-1 row-lg">
              {activeTiles[0] && renderTile(activeTiles[0], 0, numberOfTiles)}
              <div className="col-1-12_lg"></div>
              {activeTiles[1] && renderTile(activeTiles[1], 1, numberOfTiles)}
              <div className="col-2-12_lg"></div>
              {activeTiles[2] && renderTile(activeTiles[2], 2, numberOfTiles)}
              <div className="col-1-12_lg"></div>
            </div>
            <div className="row-2 row-lg">
              <div className="col-1-12_lg"></div>
              {activeTiles[3] && renderTile(activeTiles[3], 3, numberOfTiles)}
              <div className="col-2-12_lg"></div>
              {activeTiles[4] && renderTile(activeTiles[4], 4, numberOfTiles)}
            </div>
            <div className="row-3 row-lg">
              <div className="col-6-12_lg"></div>
              {activeTiles[5] && renderTile(activeTiles[5], 5, numberOfTiles)}
              <div className="col-2-12_lg"></div>
            </div>
          </>
        )
      
      case 7:
        return (
          <>
            <div className="row-1 row-lg">
              {activeTiles[0] && renderTile(activeTiles[0], 0, numberOfTiles)}
              <div className="col-1-12_lg"></div>
              {activeTiles[1] && renderTile(activeTiles[1], 1, numberOfTiles)}
              <div className="col-2-12_lg"></div>
              {activeTiles[2] && renderTile(activeTiles[2], 2, numberOfTiles)}
              <div className="col-1-12_lg"></div>
            </div>
            <div className="row-2 row-lg">
              <div className="col-1-12_lg"></div>
              {activeTiles[3] && renderTile(activeTiles[3], 3, numberOfTiles)}
              <div className="col-2-12_lg"></div>
              {activeTiles[4] && renderTile(activeTiles[4], 4, numberOfTiles)}
            </div>
            <div className="row-3 row-lg">
              <div className="col-4-12_lg"></div>
              {activeTiles[5] && renderTile(activeTiles[5], 5, numberOfTiles)}
              <div className="col-1-12_lg"></div>
              {activeTiles[6] && renderTile(activeTiles[6], 6, numberOfTiles)}
            </div>
          </>
        )
      
      default:
        return (
          <div className="row-lg">
            {activeTiles.map((tile, index) => (
              <React.Fragment key={index}>
                {tile && renderTile(tile, index, numberOfTiles)}
              </React.Fragment>
            ))}
          </div>
        )
    }
  }

  return (
    <>
      <section className={`link-tiles-block h-pad tiles-${numberOfTiles} desktop`}>
        {renderDesktopLayout()}
      </section>

      <section className={`link-tiles-block h-pad tiles-${numberOfTiles} mobile`}>
        <div className="inner-wrap">
          {/* Mobile Tile 1 */}
          {activeTiles[0] && (
            <div className="row-sm">
              <div className="tile-1 tile relative col-4-5_sm out-of-opacity">
                {activeTiles[0].mediaType === 'image' && activeTiles[0].image && (
                  <div className="fill-space-image-wrap">
                    <img 
data-src={urlFor(activeTiles[0].image).url()}
                      alt={activeTiles[0].image?.alt ?? ''}
                      className="lazy full-bleed-image"
                      style={{
                        objectPosition: activeTiles[0].image?.hotspot
                          ? `${activeTiles[0].image.hotspot.x * 100}% ${activeTiles[0].image.hotspot.y * 100}%`
                          : "center",
                      }}
                    />
                    <div className="loading-overlay" />
                  </div>
                )}

                {activeTiles[0].mediaType === 'video' && (activeTiles[0].video || activeTiles[0].videoUrl) && (
                  <div className="fill-space-video-wrap">
                    <video
                      src={activeTiles[0].videoSource === 'url' && activeTiles[0].videoUrl ? activeTiles[0].videoUrl : videoUrlFor(activeTiles[0].video)}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                    />
                  </div>
                )}

                <div className="opacity-overlay" />

                <div className="link-text">
                  <h2>{getLinkInfo(activeTiles[0].cta).text}</h2>
                </div>

                {getLinkInfo(activeTiles[0].cta).href && <a href={getLinkInfo(activeTiles[0].cta).href} {...getExternalLinkProps(activeTiles[0].cta?.linkType)}></a>}
              </div>

              <div className="col-1-5_sm"></div>
            </div>
          )}

          {/* Mobile Tile 2 */}
          {activeTiles[1] && (
            <div className="row-sm">
              <div className="col-1-5_sm"></div>

              <div className="tile-2 tile relative col-4-5_sm out-of-opacity">
                {activeTiles[1].mediaType === 'image' && activeTiles[1].image && (
                  <div className="fill-space-image-wrap">
                    <img 
data-src={urlFor(activeTiles[1].image).url()}
                      alt={activeTiles[1].image?.alt ?? ''}
                      className="lazy full-bleed-image"
                      style={{
                        objectPosition: activeTiles[1].image?.hotspot
                          ? `${activeTiles[1].image.hotspot.x * 100}% ${activeTiles[1].image.hotspot.y * 100}%`
                          : "center",
                      }}
                    />
                    <div className="loading-overlay" />
                  </div>
                )}

                {activeTiles[1].mediaType === 'video' && (activeTiles[1].video || activeTiles[1].videoUrl) && (
                  <div className="fill-space-video-wrap">
                    <video
                      src={activeTiles[1].videoSource === 'url' && activeTiles[1].videoUrl ? activeTiles[1].videoUrl : videoUrlFor(activeTiles[1].video)}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                    />
                  </div>
                )}

                <div className="opacity-overlay" />

                <div className="link-text">
                  <h2>{getLinkInfo(activeTiles[1].cta).text}</h2>
                </div>

                {getLinkInfo(activeTiles[1].cta).href && <a href={getLinkInfo(activeTiles[1].cta).href} {...getExternalLinkProps(activeTiles[1].cta?.linkType)}></a>}
              </div>
            </div>
          )}

          {/* Mobile Tile 3 */}
          {activeTiles[2] && (
            <div className="row-sm">
              <div className="tile-3 tile relative col-4-5_sm out-of-opacity">
                {activeTiles[2].mediaType === 'image' && activeTiles[2].image && (
                  <div className="fill-space-image-wrap">
                    <img 
data-src={urlFor(activeTiles[2].image).url()}
                      alt={activeTiles[2].image?.alt ?? ''}
                      className="lazy full-bleed-image"
                      style={{
                        objectPosition: activeTiles[2].image?.hotspot
                          ? `${activeTiles[2].image.hotspot.x * 100}% ${activeTiles[2].image.hotspot.y * 100}%`
                          : "center",
                      }}
                    />
                    <div className="loading-overlay" />
                  </div>
                )}

                {activeTiles[2].mediaType === 'video' && (activeTiles[2].video || activeTiles[2].videoUrl) && (
                  <div className="fill-space-video-wrap">
                    <video
                      src={activeTiles[2].videoSource === 'url' && activeTiles[2].videoUrl ? activeTiles[2].videoUrl : videoUrlFor(activeTiles[2].video)}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                    />
                  </div>
                )}

                <div className="opacity-overlay" />

                <div className="link-text">
                  <h2>{getLinkInfo(activeTiles[2].cta).text}</h2>
                </div>

                {getLinkInfo(activeTiles[2].cta).href && <a href={getLinkInfo(activeTiles[2].cta).href} {...getExternalLinkProps(activeTiles[2].cta?.linkType)}></a>}
              </div>

              <div className="col-1-5_sm"></div>
            </div>
          )}

          {/* Mobile Tile 4 */}
          {activeTiles[3] && (
            <div className="row-sm">
              <div className="col-2-5_sm"></div>

              <div className="tile-4 tile relative col-3-5_sm out-of-opacity">
                {activeTiles[3].mediaType === 'image' && activeTiles[3].image && (
                  <div className="fill-space-image-wrap">
                    <img 
data-src={urlFor(activeTiles[3].image).url()}
                      alt={activeTiles[3].image?.alt ?? ''}
                      className="lazy full-bleed-image"
                      style={{
                        objectPosition: activeTiles[3].image?.hotspot
                          ? `${activeTiles[3].image.hotspot.x * 100}% ${activeTiles[3].image.hotspot.y * 100}%`
                          : "center",
                      }}
                    />
                    <div className="loading-overlay" />
                  </div>
                )}

                {activeTiles[3].mediaType === 'video' && (activeTiles[3].video || activeTiles[3].videoUrl) && (
                  <div className="fill-space-video-wrap">
                    <video
                      src={activeTiles[3].videoSource === 'url' && activeTiles[3].videoUrl ? activeTiles[3].videoUrl : videoUrlFor(activeTiles[3].video)}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                    />
                  </div>
                )}

                <div className="opacity-overlay" />

                <div className="link-text">
                  <h2>{getLinkInfo(activeTiles[3].cta).text}</h2>
                </div>

                {getLinkInfo(activeTiles[3].cta).href && <a href={getLinkInfo(activeTiles[3].cta).href} {...getExternalLinkProps(activeTiles[3].cta?.linkType)}></a>}
              </div>
            </div>
          )}

          {/* Mobile Tile 5 */}
          {activeTiles[4] && (
            <div className="tile-5 tile relative out-of-opacity">
              {activeTiles[4].mediaType === 'image' && activeTiles[4].image && (
                <div className="fill-space-image-wrap">
                  <img 
data-src={urlFor(activeTiles[4].image).url()}
                    alt={activeTiles[4].image?.alt ?? ''}
                    className="lazy full-bleed-image"
                    style={{
                      objectPosition: activeTiles[4].image?.hotspot
                        ? `${activeTiles[4].image.hotspot.x * 100}% ${activeTiles[4].image.hotspot.y * 100}%`
                        : "center",
                    }}
                  />
                  <div className="loading-overlay" />
                </div>
              )}

              {activeTiles[4].mediaType === 'video' && (activeTiles[4].video || activeTiles[4].videoUrl) && (
                <div className="fill-space-video-wrap">
                  <video
                    src={activeTiles[4].videoSource === 'url' && activeTiles[4].videoUrl ? activeTiles[4].videoUrl : videoUrlFor(activeTiles[4].video)}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                  />
                </div>
              )}

              <div className="opacity-overlay" />

              <div className="link-text">
                <h2>{getLinkInfo(activeTiles[4].cta).text}</h2>
              </div>

              {getLinkInfo(activeTiles[4].cta).href && <a href={getLinkInfo(activeTiles[4].cta).href} {...getExternalLinkProps(activeTiles[4].cta?.linkType)}></a>}
            </div>
          )}

          {/* Mobile Tile 6 */}
          {activeTiles[5] && (
            <div className="row-sm">
              <div className="col-1-5_sm"></div>

              <div className="tile-6 tile relative col-4-5_sm out-of-opacity">
                {activeTiles[5].mediaType === 'image' && activeTiles[5].image && (
                  <div className="fill-space-image-wrap">
                    <img 
data-src={urlFor(activeTiles[5].image).url()}
                      alt={activeTiles[5].image?.alt ?? ''}
                      className="lazy full-bleed-image"
                      style={{
                        objectPosition: activeTiles[5].image?.hotspot
                          ? `${activeTiles[5].image.hotspot.x * 100}% ${activeTiles[5].image.hotspot.y * 100}%`
                          : "center",
                      }}
                    />
                    <div className="loading-overlay" />
                  </div>
                )}

                {activeTiles[5].mediaType === 'video' && (activeTiles[5].video || activeTiles[5].videoUrl) && (
                  <div className="fill-space-video-wrap">
                    <video
                      src={activeTiles[5].videoSource === 'url' && activeTiles[5].videoUrl ? activeTiles[5].videoUrl : videoUrlFor(activeTiles[5].video)}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                    />
                  </div>
                )}

                <div className="opacity-overlay" />

                <div className="link-text">
                  <h2>{getLinkInfo(activeTiles[5].cta).text}</h2>
                </div>

                {getLinkInfo(activeTiles[5].cta).href && <a href={getLinkInfo(activeTiles[5].cta).href} {...getExternalLinkProps(activeTiles[5].cta?.linkType)}></a>}
              </div>
            </div>
          )}

          {/* Mobile Tile 7 */}
          {activeTiles[6] && (
            <div className="row-sm">
              <div className="tile-7 tile relative col-4-5_sm out-of-opacity">
                {activeTiles[6].mediaType === 'image' && activeTiles[6].image && (
                  <div className="fill-space-image-wrap">
                    <img 
data-src={urlFor(activeTiles[6].image).url()}
                      alt={activeTiles[6].image?.alt ?? ''}
                      className="lazy full-bleed-image"
                      style={{
                        objectPosition: activeTiles[6].image?.hotspot
                          ? `${activeTiles[6].image.hotspot.x * 100}% ${activeTiles[6].image.hotspot.y * 100}%`
                          : "center",
                      }}
                    />
                    <div className="loading-overlay" />
                  </div>
                )}

                {activeTiles[6].mediaType === 'video' && (activeTiles[6].video || activeTiles[6].videoUrl) && (
                  <div className="fill-space-video-wrap">
                    <video
                      src={activeTiles[6].videoSource === 'url' && activeTiles[6].videoUrl ? activeTiles[6].videoUrl : videoUrlFor(activeTiles[6].video)}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                    />
                  </div>
                )}

                <div className="opacity-overlay" />

                <div className="link-text">
                  <h2>{getLinkInfo(activeTiles[6].cta).text}</h2>
                </div>

                {getLinkInfo(activeTiles[6].cta).href && <a href={getLinkInfo(activeTiles[6].cta).href} {...getExternalLinkProps(activeTiles[6].cta?.linkType)}></a>}
              </div>

              <div className="col-1-5_sm"></div>
            </div>
          )}
        </div>
      </section>
    </> 
  )
}
