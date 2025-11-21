import { page } from "../build/page";
import { tl, trans } from "../build/trans";

export function see_more() {
    if (!page.structure.container) return;

    const links = page.structure.container.querySelectorAll(':is(.more-link, .more-link-fullwidth-right) > a:not([data-see-more])');
    links.forEach(link => {
        link.setAttribute('data-see-more', true);

        link.textContent = tl(trans.see_more);
    });
}
