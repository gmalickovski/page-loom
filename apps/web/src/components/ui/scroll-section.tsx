import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "../../lib/utils";

interface ScrollSectionProps {
  id: string;
  className?: string;
  children: ReactNode;
  /** Callback when section enters the viewport */
  onEnter?: () => void;
  /** Callback when section leaves the viewport */
  onLeave?: () => void;
  /** IntersectionObserver threshold (0–1). Default 0.4 */
  threshold?: number;
  /** Root margin for earlier/later triggering */
  rootMargin?: string;
}

export function ScrollSection({
  id,
  className,
  children,
  onEnter,
  onLeave,
  threshold = 0.4,
  rootMargin = "0px",
}: ScrollSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          onEnter?.();
        } else {
          setIsVisible(false);
          onLeave?.();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, onEnter, onLeave]);

  return (
    <section
      ref={ref}
      id={id}
      className={cn(
        "scroll-section",
        isVisible && "scroll-section--visible",
        className
      )}
      data-visible={isVisible}
    >
      {children}
    </section>
  );
}

export function ScrollSectionContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("scroll-section__content", className)}>
      {children}
    </div>
  );
}
