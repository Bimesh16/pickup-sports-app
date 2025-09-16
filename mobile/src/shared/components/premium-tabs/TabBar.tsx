import React from 'react';
import './TabBar.css';
import type { TabBarProps, TabKey } from './TabTypes';

export function TabBar({ items, activeKey, onChange, compact, unreadCount = 0, profileCompletion = 100, offline = false }: TabBarProps){
  const listRef = React.useRef<HTMLDivElement>(null);
  const indicatorRef = React.useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => { setMounted(true); requestAnimationFrame(() => updateIndicator()); }, []);
  React.useEffect(() => { updateIndicator(); }, [activeKey, items]);
  React.useEffect(() => {
    const onResize = () => updateIndicator();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // sticky collapse on scroll
  const [isCompact, setIsCompact] = React.useState(!!compact);
  React.useEffect(() => { setIsCompact(!!compact); }, [compact]);
  React.useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastY + 10) setIsCompact(true); // scrolling down
      else if (y < lastY - 10) setIsCompact(false); // scrolling up
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function updateIndicator(){
    const c = listRef.current; const ind = indicatorRef.current; if (!c || !ind) return;
    const idx = items.findIndex(i => i.key === activeKey);
    const tab = c.querySelector<HTMLElement>(`[data-key="${activeKey}"]`);
    if (!tab) return;
    const rect = tab.getBoundingClientRect();
    const parentRect = c.getBoundingClientRect();
    const x = rect.left - parentRect.left;
    const w = rect.width;
    ind.style.transform = `translate3d(${x}px,0,0)`;
    ind.style.width = `${w}px`;
  }

  // roving tabindex + keyboard control
  const onKeyDown = (e: React.KeyboardEvent) => {
    const keys: TabKey[] = items.map(i => i.key);
    let idx = keys.indexOf(activeKey);
    if (e.key === 'ArrowRight'){ idx = (idx + 1) % keys.length; onChange(keys[idx]); e.preventDefault(); }
    else if (e.key === 'ArrowLeft'){ idx = (idx - 1 + keys.length) % keys.length; onChange(keys[idx]); e.preventDefault(); }
    else if (e.key === 'Home'){ onChange(keys[0]); e.preventDefault(); }
    else if (e.key === 'End'){ onChange(keys[keys.length-1]); e.preventDefault(); }
    else if (e.key === 'Enter' || e.key === ' '){ onChange(activeKey); e.preventDefault(); }
  };

  const handleActivate = (key: TabKey) => {
    if (navigator.vibrate) try { navigator.vibrate(10); } catch {}
    onChange(key);
  };

  return (
    <div className={`pt-bar ${isCompact ? 'pt-compact' : ''}`} aria-label="Primary Navigation">
      <div className="pt-bar-inner">
        {offline && <div className="pt-offline-ribbon">Offline</div>}
        <div
          className="pt-list"
          role="tablist"
          aria-label="Primary"
          ref={listRef}
          onKeyDown={onKeyDown}
        >
          {items.map((item) => {
            const selected = item.key === activeKey;
            const id = `tab-${item.key}`;
            const badge = item.key === 'notifications' && unreadCount > 0;
            const showPresence = item.key === 'profile' && (profileCompletion ?? 100) < 100;
            return (
              <button
                key={item.key}
                id={id}
                data-key={item.key}
                role="tab"
                aria-selected={selected}
                aria-controls={`panel-${item.key}`}
                tabIndex={selected ? 0 : -1}
                className="pt-tab"
                onClick={() => handleActivate(item.key)}
                aria-disabled={item.disabled ? true : undefined}
                title={item.label}
              >
                <span className="pt-icon" aria-hidden>{item.icon}</span>
                <span className="pt-label">{item.label}</span>
                {badge && <span className="pt-badge" aria-label={`${unreadCount} unread`}>{unreadCount > 99 ? '99+' : unreadCount}</span>}
                {showPresence && <span className="pt-presence" aria-hidden />}
              </button>
            );
          })}
          <div ref={indicatorRef} className="pt-indicator" aria-hidden />
        </div>
      </div>
    </div>
  );
}

