// Inline SVG icons for the site chrome (no icon font, no external requests).
type P = { className?: string };

/** Wix Stores cart icon (shopping bag), same shape as on the live site. */
export function CartIcon({ className }: P) {
  return (
    <svg viewBox="0 0 105.5 126.1" className={className} aria-hidden="true" focusable="false">
      <path d="M102.143 118.16L93.812 48.2067C93.386 44.66 90.3566 42 86.7591 42H79.1382V56H74.4047V42H31.8032V56H27.0697V42H19.4488C15.8513 42 12.8219 44.66 12.3959 48.16L4.06489 118.16C3.78088 120.167 4.44357 122.173 5.76895 123.667C7.14167 125.16 9.0824 126 11.0705 126H95.1374C97.1255 126 99.0662 125.16 100.439 123.667C101.764 122.173 102.427 120.167 102.143 118.16Z" />
      <path d="M32.0594 25.6667C32.0594 14.0933 41.506 4.66667 53.1039 4.66667C64.7018 4.66667 74.1485 14.0933 74.1485 25.6667V42H78.825V25.6667C78.825 11.5267 67.2739 0 53.1039 0C38.9339 0 27.3828 11.5267 27.3828 25.6667V42H32.0594V25.6667Z" />
    </svg>
  );
}

export function SearchIcon({ className }: P) {
  return (
    <svg viewBox="5 5 14 14" className={className} aria-hidden="true" focusable="false">
      <path fill="currentColor" d="m15.683 14.6 3.265 3.265a.2.2 0 0 1 0 .282l-.8.801a.2.2 0 0 1-.283 0l-3.266-3.265a5.961 5.961 0 1 1 1.084-1.084zm-4.727 1.233a4.877 4.877 0 1 0 0-9.754 4.877 4.877 0 0 0 0 9.754" />
    </svg>
  );
}

export function FacebookIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" />
    </svg>
  );
}

export function InstagramIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2.2">
      <rect x="2" y="2" width="20" height="20" rx="5.5" />
      <circle cx="12" cy="12" r="4.6" />
      <circle cx="17.6" cy="6.4" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Footer sprout icon (Wix vector image comp-kh61jrwn). */
export function SproutIcon({ className }: P) {
  return (
    <svg viewBox="12.503 26.653 47.289 35.961" className={className} aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M36.148 40.245c-2.293-5.574-7.687-13.591-19.729-13.591-.737 0-1.502.031-2.273.091a1.787 1.787 0 0 0-1.639 1.898c.013.187 1.484 18.617 21.701 20.713v11.409c0 1.054.747 1.849 1.738 1.849.99 0 1.737-.795 1.737-1.849V49.39c20.514-1.885 22.092-20.556 22.105-20.747a1.787 1.787 0 0 0-1.639-1.899 29.472 29.472 0 0 0-2.274-.091c-12.038 0-17.433 8.018-19.727 13.592zm1.953 5.534c.365-1.638 1.115-4.246 2.562-6.822 3.257-5.8 8.376-8.741 15.214-8.741h.078c-.96 4.616-4.547 14.022-17.854 15.563zm-3.887.002c-13.319-1.536-16.911-10.947-17.872-15.565h.075c12.876 0 16.695 10.397 17.797 15.565z" />
    </svg>
  );
}

export function MenuIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

export function CloseIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  );
}

export function ChevronIcon({ className }: P) {
  return (
    <svg viewBox="0 0 16 11" className={className} aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M8 10.5L16 1.86193L14.7387 0.5L8 7.77613L1.26133 0.499999L-5.95321e-08 1.86193L8 10.5Z" />
    </svg>
  );
}
