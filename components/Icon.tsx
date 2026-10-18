import React from 'react';

const paths = {
  home: <><path d="m3 10 9-7 9 7v10H3Z" /><path d="M9 20v-7h6v7" /></>,
  chart: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /><path d="M12 3v5m0 8v5M3 12h5m8 0h5M5.6 5.6l3.5 3.5m5.8 5.8 3.5 3.5M18.4 5.6l-3.5 3.5m-5.8 5.8-3.5 3.5" /></>,
  orbit: <><circle cx="12" cy="12" r="3" /><ellipse cx="12" cy="12" rx="11" ry="5" transform="rotate(-38 12 12)" /><path d="M5 7a8.6 8.6 0 0 1 14 10M5 17a8.6 8.6 0 0 1 0-10" /><circle cx="19" cy="5" r="1.3" fill="currentColor" stroke="none" /></>,
  spark: <><path d="m12 2 2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6Z" /><path d="m20 2 .6 1.4L22 4l-1.4.6L20 6l-.6-1.4L18 4l1.4-.6Z" /></>,
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  chevron: <path d="m9 6 6 6-6 6" />,
  moon: <path d="M20.5 13A8.5 8.5 0 0 1 11 3.5 8.5 8.5 0 1 0 20.5 13Z" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M20 4l-2 2M6 18l-2 2" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 2v6m10-6v6M3 11h18m-13 5h2m4 0h2" /></>,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6m0-10v.1" /></>,
  send: <path d="m12 19 0-14m-6 6 6-6 6 6" />,
  filter: <path d="M3 6h18M6 12h12m-9 6h6" />,
  back: <path d="m15 6-6 6 6 6" />,
  refresh: <path d="M20 8a8 8 0 1 0 0 8M20 3v5h-5" />,
};
export type IconName = keyof typeof paths;
export default function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
