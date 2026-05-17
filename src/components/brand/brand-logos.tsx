/* Inline SVG marks of common workplace tools.
   These are decorative trust-strip logos rendered in monochrome (slate) so they
   feel cohesive on the white canvas — like Apple's customer logo strips. */

export function BrandLogos() {
  return (
    <div className="flex items-center gap-14 px-7 text-slate-400">
      <SlackMark />
      <GoogleMark />
      <NotionMark />
      <LinearMark />
      <GitHubMark />
      <FigmaMark />
      <JiraMark />
      <MicrosoftMark />
    </div>
  );
}

const wrap = "h-7 w-auto opacity-80 hover:opacity-100 transition-opacity";

function SlackMark() {
  return (
    <svg viewBox="0 0 124 32" className={wrap} fill="currentColor" aria-label="Slack">
      <g>
        <path d="M8.3 19.6c0 1.7-1.4 3-3 3s-3-1.4-3-3 1.4-3 3-3h3v3zm1.5 0c0-1.7 1.4-3 3-3s3 1.4 3 3v7.5c0 1.7-1.4 3-3 3s-3-1.4-3-3v-7.5zM12.8 7.6c-1.7 0-3-1.4-3-3s1.4-3 3-3 3 1.4 3 3v3h-3zm0 1.5c1.7 0 3 1.4 3 3s-1.4 3-3 3H5.3c-1.7 0-3-1.4-3-3s1.4-3 3-3h7.5zM24.8 12.1c0-1.7 1.4-3 3-3s3 1.4 3 3-1.4 3-3 3h-3v-3zm-1.5 0c0 1.7-1.4 3-3 3s-3-1.4-3-3V4.6c0-1.7 1.4-3 3-3s3 1.4 3 3v7.5zM20.3 24.1c1.7 0 3 1.4 3 3s-1.4 3-3 3-3-1.4-3-3v-3h3zm0-1.5c-1.7 0-3-1.4-3-3s1.4-3 3-3h7.5c1.7 0 3 1.4 3 3s-1.4 3-3 3h-7.5z" />
        <text x="40" y="22" fontFamily="ui-sans-serif, system-ui, -apple-system" fontWeight="700" fontSize="16">slack</text>
      </g>
    </svg>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 140 32" className={wrap} fill="currentColor" aria-label="Google">
      <text x="0" y="24" fontFamily="ui-sans-serif, system-ui, -apple-system" fontWeight="700" fontSize="22" letterSpacing="-0.5">Google</text>
    </svg>
  );
}

function NotionMark() {
  return (
    <svg viewBox="0 0 130 32" className={wrap} fill="currentColor" aria-label="Notion">
      <g>
        <rect x="2" y="4" width="24" height="24" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M9 10 L9 22 M9 10 L17 22 M17 10 L17 22" stroke="currentColor" strokeWidth="2" fill="none" />
        <text x="32" y="22" fontFamily="ui-serif, Georgia, serif" fontWeight="700" fontSize="18">Notion</text>
      </g>
    </svg>
  );
}

function LinearMark() {
  return (
    <svg viewBox="0 0 110 32" className={wrap} fill="currentColor" aria-label="Linear">
      <g>
        <rect x="4" y="6" width="20" height="20" rx="4" fill="currentColor" opacity="0.9" />
        <path d="M8 18 L18 8 M6 22 L22 6 M10 22 L22 10" stroke="white" strokeWidth="1.2" />
        <text x="32" y="22" fontFamily="ui-sans-serif, system-ui" fontWeight="600" fontSize="16">Linear</text>
      </g>
    </svg>
  );
}

function GitHubMark() {
  return (
    <svg viewBox="0 0 130 32" className={wrap} fill="currentColor" aria-label="GitHub">
      <g>
        <path d="M14 4a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.93.36.31.68.92.68 1.86v2.75c0 .27.18.58.69.48A10 10 0 0 0 14 4z" />
        <text x="30" y="22" fontFamily="ui-sans-serif, system-ui" fontWeight="700" fontSize="16">GitHub</text>
      </g>
    </svg>
  );
}

function FigmaMark() {
  return (
    <svg viewBox="0 0 110 32" className={wrap} fill="currentColor" aria-label="Figma">
      <g>
        <circle cx="14" cy="9" r="4" fill="currentColor" />
        <circle cx="14" cy="16" r="4" fill="currentColor" opacity="0.7" />
        <circle cx="14" cy="23" r="4" fill="currentColor" opacity="0.5" />
        <circle cx="21" cy="16" r="4" fill="currentColor" opacity="0.9" />
        <text x="30" y="22" fontFamily="ui-sans-serif, system-ui" fontWeight="700" fontSize="16">Figma</text>
      </g>
    </svg>
  );
}

function JiraMark() {
  return (
    <svg viewBox="0 0 90 32" className={wrap} fill="currentColor" aria-label="Jira">
      <g>
        <path d="M16 4 L24 12 L16 20 L8 12 Z" fill="currentColor" />
        <path d="M16 12 L24 20 L16 28 L8 20 Z" fill="currentColor" opacity="0.6" />
        <text x="32" y="22" fontFamily="ui-sans-serif, system-ui" fontWeight="700" fontSize="16">Jira</text>
      </g>
    </svg>
  );
}

function MicrosoftMark() {
  return (
    <svg viewBox="0 0 160 32" className={wrap} fill="currentColor" aria-label="Microsoft">
      <g>
        <rect x="2" y="4" width="11" height="11" fill="currentColor" />
        <rect x="15" y="4" width="11" height="11" fill="currentColor" opacity="0.8" />
        <rect x="2" y="17" width="11" height="11" fill="currentColor" opacity="0.6" />
        <rect x="15" y="17" width="11" height="11" fill="currentColor" opacity="0.85" />
        <text x="32" y="22" fontFamily="ui-sans-serif, system-ui" fontWeight="600" fontSize="16">Microsoft</text>
      </g>
    </svg>
  );
}
