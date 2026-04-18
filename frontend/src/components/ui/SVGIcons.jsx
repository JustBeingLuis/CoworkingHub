// SVGIcons.jsx - Premium vector flag icons

export const FlagES = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 500" className={className} aria-label="Español">
    <rect width="750" height="500" fill="#c60b1e" />
    <rect width="750" height="250" y="125" fill="#ffc400" />
    <circle cx="250" cy="250" r="80" fill="#c60b1e" opacity="0.3" />
    {/* Simplified shield visual representation to avoid intense path rendering */}
  </svg>
);

export const FlagUS = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7410 3900" className={className} aria-label="English">
    <rect width="7410" height="3900" fill="#b22234" />
    <path d="M0,450H7410m0,600H0m0,600H7410m0,600H0m0,600H7410m0,600H0" stroke="#fff" strokeWidth="300" />
    <rect width="2964" height="2100" fill="#3c3b6e" />
    <g fill="#fff">
      {/* Abstracted star pattern for visual proxy */}
      <circle cx="500" cy="500" r="100"/>
      <circle cx="1000" cy="500" r="100"/>
      <circle cx="1500" cy="500" r="100"/>
      <circle cx="2000" cy="500" r="100"/>
      <circle cx="2500" cy="500" r="100"/>
      <circle cx="750" cy="800" r="100"/>
      <circle cx="1250" cy="800" r="100"/>
      <circle cx="1750" cy="800" r="100"/>
      <circle cx="2250" cy="800" r="100"/>
      <circle cx="500" cy="1100" r="100"/>
      <circle cx="1000" cy="1100" r="100"/>
      <circle cx="1500" cy="1100" r="100"/>
      <circle cx="2000" cy="1100" r="100"/>
      <circle cx="2500" cy="1100" r="100"/>
      <circle cx="750" cy="1400" r="100"/>
      <circle cx="1250" cy="1400" r="100"/>
      <circle cx="1750" cy="1400" r="100"/>
      <circle cx="2250" cy="1400" r="100"/>
      <circle cx="500" cy="1700" r="100"/>
      <circle cx="1000" cy="1700" r="100"/>
      <circle cx="1500" cy="1700" r="100"/>
      <circle cx="2000" cy="1700" r="100"/>
      <circle cx="2500" cy="1700" r="100"/>
    </g>
  </svg>
);
