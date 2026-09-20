This file is to the central file to hold the project togehter.

Github: https://github.com/hello-rohanshu/geoscope-website
All URLS: https://vercel.com/rohanshus-projects/geoscope/settings/domains

Related files:
- README.md
- CHANGELOG.md
- CONCEPTS.md

Announcement date of release: 13-09-2026
Personally ascribed data for version 1: 05-09-2026

---

Current issues:
- Confusion with the structure: What should the homepage be like? 
- What is the priority in terms of UX?

Archived issues:


---

CODE DUMP

<!-- /* LIKELY OUTDATED INFO
## Lenis + Nested Scroll: The Contract

```tsx
// 1. Scroll container requires data-lenis-prevent and flex layout constraint
const contentRef = useRef<HTMLDivElement>(null);

// Reset scroll on item change
useEffect(() => {
  if (contentRef.current) contentRef.current.scrollTop = 0;
}, [activeIdx]);

<div
  ref={contentRef}
  data-lenis-prevent   // tells Lenis to ignore wheel events here
  className="flex-1 min-h-0 overflow-y-auto"  // min-h-0 prevents flex blowout
>
  <div key={activeItem.id}>   // key on INNER wrapper to re-trigger animations
    {content}
  </div>
</div>

*/ -->