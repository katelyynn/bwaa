//
// bwaa, an extension for the music site Last.fm
// Copyright (c) 2025 katelyn and contributors
// Licensed under GPLv3
//

import {html, render} from 'lighterhtml';
import {page} from '../build/page';
import {tl, trans} from '../build/trans';

export function bleh_radio() {
    if (page.type == 'user') {
        const promo_v3 = page.structure.side.querySelector('.promo-v3');
        if (!promo_v3) return;

        //let header = promo_v3.querySelector('h2');
        //header.textContent = tl(trans.listening);

        const promos = promo_v3.querySelectorAll('.listening-report-promo');
        promos.forEach(report => {
            report.classList.remove('listening-report-promo');
            report.classList.add('listen-report', 'journal-like');

            const date = report.querySelector('.listening-report-promo-date').textContent;
            const title = report.querySelector('.listening-report-promo-title').textContent.replace('.', ' ');

            render(report, html`
                <div class="title">${title}</div>
                <div class="date">${date}</div>
            `);
        });
    }
}
