//
// bwaa, an extension for the music site Last.fm
// Copyright (c) 2025 katelyn and contributors
// Licensed under GPLv3
//

import { html } from 'lighterhtml';
import { tl, trans } from './build/trans';
import { root } from './build/page';
import { settings } from './build/config';
import { version } from './main';

export function bleh_footer() {
    const footer = document.body.querySelector('footer.footer');

    const container = footer.querySelector('.container');

    const quote = version.quote || 'cute quote here';
    const year = settings.page_style || new Date().getFullYear();

    container.appendChild(html.node`
        <div class="cute-quote-container">
            <div class="quote">“${quote}”</div>
            <div class="more">
                <strong>${tl(trans.more_lastfm_sites)}</strong>: <a href="https://blog.last.fm">${tl(trans.blog)}</a> | <a href="https://musicmanager.last.fm">${tl(trans.music_manager)}</a> | <a href="https://build.last.fm">${tl(trans.build)}</a> | <a href="https://playground.last.fm">${tl(trans.playground)}</a>
            </div>
        </div>
        <div class="legal">
            <div class="logos">
                <div class="cbs-logo" />
                <div class="audioscrobbler-logo" style="background-image: url(/static/images/footer_logo@2x.49ca51948b0a.png)" />
            </div>
            <div class="text">
                ${tl(trans.copyright, { y: year })} | <a href="${root}legal/terms">${tl(trans.terms_of_use)}</a> ${tl(trans.and)} <a href="${root}legal/privacy">${tl(trans.privacy_policy)}</a> | <i class="update-date">${tl(trans.updated_year, { y: year })}</i>
            </div>
        </div>
    `);
}
