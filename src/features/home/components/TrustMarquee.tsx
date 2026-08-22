'use client';

import { motion, useAnimationControls, useReducedMotion } from 'framer-motion';
import { BadgeCheck, Building2, Clock, Heart, MapPin, Search, Shield, UserCheck, type LucideIcon } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocale } from '@/lib/i18n/locale-provider';
import type { TranslationKey } from '@/lib/i18n/ar';

type TrustItemDef = { icon: LucideIcon; key: TranslationKey };

const BASE_ITEMS: TrustItemDef[] = [
  { icon: BadgeCheck, key: 'trust.verified' },
  { icon: Search, key: 'trust.search' },
  { icon: MapPin, key: 'trust.maps' },
  { icon: Shield, key: 'trust.secure' },
  { icon: Building2, key: 'trust.listings' },
  { icon: UserCheck, key: 'trust.agents' },
  { icon: Clock, key: 'trust.updates' },
  { icon: Heart, key: 'trust.saved' },
];

const ITEM_COUNT = BASE_ITEMS.length;

/** px per second */
const SCROLL_SPEED = 38;

function TrustItem({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-white/70 whitespace-nowrap sm:text-sm">
      <Icon className="h-3.5 w-3.5 shrink-0 text-brand-light sm:h-4 sm:w-4" strokeWidth={2} />
      {label}
    </span>
  );
}

export function TrustMarquee() {
  const { t, locale } = useLocale();
  const reducedMotion = useReducedMotion();
  const controls = useAnimationControls();
  const containerRef = useRef<HTMLDivElement>(null);
  const [order, setOrder] = useState(BASE_ITEMS);
  const [slotWidth, setSlotWidth] = useState(0);
  const [tick, setTick] = useState(0);

  useLayoutEffect(() => {
    setOrder(BASE_ITEMS);
    setTick((n) => n + 1);
  }, [locale]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => setSlotWidth(el.offsetWidth / ITEM_COUNT);
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [locale]);

  useEffect(() => {
    if (reducedMotion || slotWidth <= 0) return;

    let active = true;

    controls.set({ x: 0 });
    void controls
      .start({
        x: -slotWidth,
        transition: { duration: slotWidth / SCROLL_SPEED, ease: 'linear' },
      })
      .then(() => {
        if (!active) return;
        controls.set({ x: 0 });
        setOrder((prev) => [...prev.slice(1), prev[0]!]);
        setTick((n) => n + 1);
      });

    return () => {
      active = false;
      controls.stop();
    };
  }, [tick, slotWidth, reducedMotion, controls]);

  // Tail clone = invisible handoff when the lead item exits left and rotates to the back
  const track = [...order, order[0]!];

  return (
    <div
      ref={containerRef}
      className="mt-10 md:mt-12 w-full overflow-hidden border-y border-white/10 bg-black/10 py-3 backdrop-blur-sm"
    >
      {reducedMotion ? (
        <div className="flex items-center justify-between gap-2 px-3 sm:px-4">
          {order.map((item) => (
            <TrustItem key={item.key} icon={item.icon} label={t(item.key)} />
          ))}
        </div>
      ) : (
        <div className="flex w-full justify-end" dir="ltr">
          <motion.div className="flex w-max items-center" animate={controls} initial={{ x: 0 }}>
            {track.map((item, index) => (
              <div
                key={`${item.key}-${index}`}
                className="flex shrink-0 items-center justify-center px-1 sm:px-2"
                style={{ width: slotWidth > 0 ? slotWidth : `${100 / ITEM_COUNT}vw` }}
              >
                <TrustItem icon={item.icon} label={t(item.key)} />
              </div>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
}
