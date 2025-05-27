import type { SVGProps } from 'react';

export function ClimaBillLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="120"
      height="30"
      aria-label="ClimaBill Logo"
      {...props}
    >
      <rect width="200" height="50" fill="none" />
      <text
        x="10"
        y="35"
        fontFamily="var(--font-geist-sans), Arial, sans-serif"
        fontSize="30"
        fontWeight="bold"
        fill="currentColor"
      >
        ClimaBill
      </text>
      <path
        d="M150 15 Q 155 10, 160 15 T 170 15 Q 175 20, 170 25 T 160 25 Q 155 20, 160 15"
        stroke="currentColor"
        strokeWidth="2"
        fill="hsl(var(--accent))"
        opacity="0.7"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 160 20"
          to="360 160 20"
          dur="10s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}
