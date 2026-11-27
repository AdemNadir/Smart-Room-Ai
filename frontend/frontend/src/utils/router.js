import { useEffect, useState } from 'react';

export function readRoute() {
  const hash = window.location.hash || '#/search';
  const [pathPart, queryPart] = hash.replace(/^#/, '').split('?');
  const path = pathPart || '/search';
  const params = {};
  if (queryPart) {
    new URLSearchParams(queryPart).forEach((value, key) => {
      params[key] = value;
    });
  }
  return { path, params };
}

export function navigate(path) {
  const next = path.startsWith('#') ? path : `#${path}`;
  if (window.location.hash === next) return;
  window.location.hash = next;
}

export function isActivePath(current, target) {
  if (target === '/admin') return current === '/admin';
  return current === target || current.startsWith(`${target}/`);
}

export function useHashRoute() {
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    const update = () => setRoute(readRoute());
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);

  return route;
}
