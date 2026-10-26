import { SOCIAL } from "@/content/site";
import { FacebookIcon, InstagramIcon } from "./Icons";

const LINKS = [
  { href: SOCIAL.facebook, label: "Facebook", Icon: FacebookIcon },
  { href: SOCIAL.instagram, label: "Instagram", Icon: InstagramIcon },
];

/** Wix social bar: Facebook and Instagram, white icons, open in a new tab. */
export default function SocialLinks({ size = 19, gap = 5, className = "" }: { size?: number; gap?: number; className?: string }) {
  return (
    <ul className={`flex items-center text-white ${className}`} style={{ gap }}>
      {LINKS.map(({ href, label, Icon }) => (
        <li key={label} style={{ width: size, height: size }}>
          <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`${label} (ανοίγει σε νέα καρτέλα)`} className="block h-full w-full hover:opacity-80">
            <Icon className="block h-full w-full" />
          </a>
        </li>
      ))}
    </ul>
  );
}
