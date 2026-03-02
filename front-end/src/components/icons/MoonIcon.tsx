import type { SVGProps } from "react";

function MoonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M9.598 2.03a.75.75 0 0 1 .785.127 9 9 0 0 0 11.584 11.585.75.75 0 0 1 .912.912A10.5 10.5 0 1 1 9.344 1.119a.75.75 0 0 1 .254.911Z" />
    </svg>
  );
}

export default MoonIcon;