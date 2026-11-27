const PATHS = {
  search: <><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="1" /><path d="M7 3v4M17 3v4M3 10h18" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  users: <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 5a3 3 0 0 1 0 6M18 14c1.8.8 3 2.4 3 4.5" /></>,
  room: <><path d="M3 21V7l9-4 9 4v14M3 21h18M8 21v-6h8v6M7 10h.01M12 10h.01M17 10h.01" /></>,
  check: <path d="m4 12 5 5L20 6" />,
  alert: <><path d="M12 3 2 20h20L12 3Z" /><path d="M12 9v5M12 17h.01" /></>,
  arrowRight: <><path d="M4 12h16M14 6l6 6-6 6" /></>,
  arrowLeft: <><path d="M20 12H4M10 6l-6 6 6 6" /></>,
  signout: <><path d="M10 4H5v16h5M14 8l4 4-4 4M18 12H9" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M5 5l14 14M19 5 5 19" />,
  book: <><path d="M4 4h7a3 3 0 0 1 3 3v13a3 3 0 0 0-3-3H4V4ZM20 4h-3a3 3 0 0 0-3 3v13a3 3 0 0 1 3-3h3V4Z" /></>,
  upload: <><path d="M12 16V4M7 9l5-5 5 5M4 16v4h16v-4" /></>,
  shield: <><path d="M12 3 4 6v6c0 5 3.4 8 8 9 4.6-1 8-4 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></>,
  chart: <><path d="M4 20h16M6 20V9M11 20V4M16 20v-7" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.4 1a7 7 0 0 0-1.7-1L14.5 3h-4l-.3 2a7 7 0 0 0-1.7 1l-2.4-1-2 3.5L6 11a7 7 0 0 0 0 2l-2 1.5 2 3.5 2.4-1a7 7 0 0 0 1.7 1l.3 2h4l.3-2a7 7 0 0 0 1.7-1l2.4 1 2-3.5-2-1.5a7 7 0 0 0 .1-1Z" /></>,
  filter: <path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z" />,
  refresh: <><path d="M20 11a8 8 0 1 0-2.3 6" /><path d="M20 5v6h-6" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7h.01" /></>,
  key: <><circle cx="8" cy="15" r="4" /><path d="m11 12 8-8 2 2-2 2 1 1-2 2-1-1-2 2" /></>,
  edit: <><path d="M4 20h4l10-10-4-4L4 16v4Z" /><path d="m13 7 4 4" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
};

export default function Icon({ name, size = 18 }) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name] ?? PATHS.info}
    </svg>
  );
}
