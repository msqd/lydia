export interface DefaultAvatarProps {
  className?: string;
}

export function DefaultAvatar({ className = "size-8 rounded-full" }: DefaultAvatarProps) {
  return (
    <svg
      className={className}
      width="40"
      height="40"
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="20" fill="#6366F1" />
      <path
        d="M20 20C23.3137 20 26 17.3137 26 14C26 10.6863 23.3137 8 20 8C16.6863 8 14 10.6863 14 14C14 17.3137 16.6863 20 20 20Z"
        fill="white"
      />
      <path d="M10 32C10 26.4772 14.4772 22 20 22C25.5228 22 30 26.4772 30 32V33H10V32Z" fill="white" />
    </svg>
  );
}
