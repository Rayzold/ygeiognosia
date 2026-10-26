import { ADDRESS, FOOTER, PHONE } from "@/content/site";
import { SproutIcon } from "./Icons";
import SocialLinks from "./SocialLinks";

const bullet = "before:mr-[0.6em] before:content-['•']";

/**
 * Site footer. Desktop: the Wix 980×257 panel (green #6B8841 at 44%), elements at their measured positions.
 * Mobile: the Wix mobile footer, centred.
 */
export default function Footer() {
  const phone = (
    <a href={`tel:${PHONE.tel}`} className="whitespace-nowrap hover:underline">
      {PHONE.display}
    </a>
  );
  return (
    <footer className="text-white">
      {/* desktop */}
      <div className="relative mx-auto hidden h-[257px] w-[980px] bg-green-4/[0.44] text-[15px] leading-[1.4] desk:block">
        <div className="absolute left-[44px] top-[33px] flex items-center gap-[12px]">
          <p className="whitespace-nowrap font-script text-[25px] leading-[1.4]">{FOOTER.follow}</p>
          <SocialLinks />
        </div>
        <hr className="absolute left-[44px] top-[119px] w-[305px] border-0 border-t border-white" />
        <p className="absolute left-[44px] top-[187px] whitespace-pre text-[13px]">{FOOTER.copyright}</p>
        <SproutIcon className="absolute left-[284px] top-[186px] h-[19px] w-[25px] text-white" />

        <p className={`absolute left-[460px] top-[25px] ${bullet}`}>
          {FOOTER.phoneOrders}&nbsp; {phone}
        </p>
        <p className={`absolute left-[460px] top-[84px] ${bullet}`}>{FOOTER.pickup}</p>
        <p className="absolute left-[472px] top-[108px]">{ADDRESS.footer}</p>
        <p className={`absolute left-[460px] top-[163px] ${bullet}`}>{FOOTER.delivery}</p>
        <p className="absolute left-[472px] top-[186px] text-[11px]">{FOOTER.deliveryAreas}</p>
      </div>

      {/* mobile */}
      <div className="bg-green-4/[0.44] px-4 pb-10 pt-6 text-center text-[13px] leading-[1.5] desk:hidden">
        <p className="font-script text-[22px]">{FOOTER.follow}</p>
        <SocialLinks size={26} gap={24} className="mt-3 justify-center" />
        <p className="mt-5 flex items-center justify-center gap-2 whitespace-pre">
          <SproutIcon className="h-[19px] w-[25px] shrink-0" />
          {FOOTER.copyright}
        </p>
        <hr className="mt-3 border-0 border-t border-white" />
        <ul className="mt-4 space-y-3">
          <li>
            <span className={bullet}>{FOOTER.phoneOrders}</span>&nbsp; {phone}
          </li>
          <li>
            <span className={bullet}>{FOOTER.pickup}</span>
            <br />
            {ADDRESS.footer}
          </li>
          <li>
            <span className={bullet}>{FOOTER.delivery}</span>
            <br />
            <span className="text-[11px]">{FOOTER.deliveryAreas}</span>
          </li>
        </ul>
      </div>
    </footer>
  );
}
