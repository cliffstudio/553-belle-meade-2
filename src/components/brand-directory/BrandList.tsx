"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { BrandDirectoryItem } from "./types";

interface BrandListProps {
  items: BrandDirectoryItem[];
  activeIndex: number;
  progressIndex: number;
}

function BrandList({ items, activeIndex, progressIndex }: BrandListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const activeIndexRef = useRef(activeIndex);
  const prevActiveIndexRef = useRef(activeIndex);

  activeIndexRef.current = activeIndex;

  const updateScrollPadding = useCallback(() => {
    const container = scrollRef.current;
    const inner = innerRef.current;
    if (!container || !inner) return;
    const ch = Math.max(container.clientHeight, 0);
    inner.style.paddingTop = "0px";
    inner.style.paddingBottom = `${ch}px`;
  }, []);

  const scrollActiveToTop = useCallback((behavior: ScrollBehavior) => {
    const container = scrollRef.current;
    const inner = innerRef.current;
    const idx = activeIndexRef.current;
    const item = itemRefs.current[idx];
    if (!container || !inner || !item) return;

    const ch = container.clientHeight;
    if (ch <= 0) return;

    const target = item.offsetTop;
    const maxScroll = Math.max(0, container.scrollHeight - ch);
    const nextTop = Math.min(Math.max(target, 0), maxScroll);

    if (Math.abs(container.scrollTop - nextTop) < 0.5) return;

    container.scrollTo({ top: nextTop, behavior });
  }, []);

  useLayoutEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, items.length);
  }, [items.length]);

  useLayoutEffect(() => {
    updateScrollPadding();
    scrollActiveToTop("auto");
  }, [activeIndex, items, scrollActiveToTop, updateScrollPadding]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const onResize = () => {
      updateScrollPadding();
      scrollActiveToTop("auto");
    };

    const ro = new ResizeObserver(onResize);
    ro.observe(container);
    window.addEventListener("resize", onResize);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [scrollActiveToTop, updateScrollPadding]);

  useEffect(() => {
    if (prevActiveIndexRef.current === activeIndex) return;
    prevActiveIndexRef.current = activeIndex;
    const id = window.setTimeout(() => {
      updateScrollPadding();
      scrollActiveToTop("auto");
    }, 450);
    return () => window.clearTimeout(id);
  }, [activeIndex, scrollActiveToTop, updateScrollPadding]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      window.scrollBy({ top: e.deltaY, left: e.deltaX, behavior: "auto" });
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div className="brand-directory-list__left">
      <div
        ref={scrollRef}
        className="brand-directory-list__scroll"
        role="region"
        aria-label="Brand list"
      >
        <div ref={innerRef} className="brand-directory-list__scroll-inner">
          {items.map((brand, index) => {
            const distanceFromProgress = Math.abs(progressIndex - index);
            const style = {
              "--brand-row-opacity": Math.max(
                0.5,
                1 - distanceFromProgress * 0.5,
              ),
            } as React.CSSProperties;

            return (
              <Link
                key={brand.id}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                href={brand.href}
                className={`brand-directory-list__title-wrap ${activeIndex === index ? "is-active" : ""}`}
                style={style}
              >
                <span className="brand-directory-list__title h1">
                  {brand.title}
                </span>
                {brand.shortDescription && (
                  <span className="brand-directory-list__description">
                    {brand.shortDescription}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default BrandList;
