import React, { createContext, useContext, useState, useEffect, ReactNode, AnchorHTMLAttributes, MouseEvent } from 'react';
import { RoutePath } from '@/types';

interface RouterContextType {
  pathname: RoutePath;
  navigate: (to: RoutePath) => void;
}

const RouterContext = createContext<RouterContextType>({
  pathname: '/',
  navigate: () => {},
});

function normalizePath(rawPath: string): RoutePath {
  const clean = rawPath.split('?')[0].split('#')[0];
  const validPaths: RoutePath[] = [
    '/',
    '/dashboard',
    '/family',
    '/documents',
    '/medicines',
    '/appointments',
    '/emergency',
    '/doctor-summary',
    '/settings',
  ];

  if (validPaths.includes(clean as RoutePath)) {
    return clean as RoutePath;
  }
  return '/';
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [pathname, setPathname] = useState<RoutePath>(() => {
    if (typeof window !== 'undefined') {
      return normalizePath(window.location.pathname);
    }
    return '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      try {
        setPathname(normalizePath(window.location.pathname));
      } catch {
        // Safe fallback in restricted sandboxes
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: RoutePath) => {
    if (typeof window !== 'undefined') {
      try {
        if (window.location.pathname !== to) {
          window.history.pushState({}, '', to);
        }
      } catch {
        // Fallback for sandboxed iframes where pushState may be restricted
      }
      setPathname(to);
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch {
        // Ignore scroll errors in environments that do not support it
      }
    }
  };

  return (
    <RouterContext.Provider value={{ pathname, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  return useContext(RouterContext);
}

export function usePathname(): RoutePath {
  const { pathname } = useContext(RouterContext);
  return pathname;
}

export interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: RoutePath;
  children: ReactNode;
}

export const Link: React.FC<LinkProps> = ({ href, children, onClick, className, ...props }) => {
  const { navigate } = useRouter();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // If modifier keys are pressed, let default browser behavior handle it (e.g. open in new tab)
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    e.preventDefault();
    if (onClick) onClick(e);
    navigate(href);
  };

  return (
    <a href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
};
