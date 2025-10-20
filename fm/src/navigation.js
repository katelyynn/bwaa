//
// bwaa, an extension for the music site Last.fm
// Copyright (c) 2025 katelyn and contributors
// Licensed under GPLv3
//

import { settings } from './build/config';
import { auth, discord, page, root } from './build/page';
import { stored_season } from './build/seasonal';
import { tl, trans } from './build/trans';
import { create_badge, load_badges } from './components/badge';
import { version } from './main';
import { ff } from './sku';
import { html, render } from 'lighterhtml';
import { news } from './news.js';
import { save_setting, setting } from './components/settings.js';
import { prompt_for_update } from './style.js';
import tippy from 'tippy.js';
import { sponsor } from './sponsor.js';
import { register_menu } from './components/menu.js';
import { DateTime } from 'luxon';

export function patch_masthead() {
    let masthead_logo = document.body.querySelector('.masthead-logo');
    if (!masthead_logo) return;

    if (!masthead_logo.hasAttribute('data-kate-processed')) {
        masthead_logo.setAttribute('data-kate-processed', 'true');

        update_masthead(masthead_logo);
    }
}

export function update_masthead(
    masthead_logo = document.body.querySelector('.masthead-logo')
) {
    const update_required =
        localStorage.getItem('bleh_update_required') || 'false';

    let home_link;

    render(masthead_logo, html``);
    render(
        masthead_logo,
        html`
            <a href="/">Last.fm</a>
            <a
                class="home-link"
                href="${root}music"
                ref=${(el) => (home_link = el)}
            >
                <div class="bleh-logo">${version.brand}</div>
                <div class="lastfm-logo">Last.fm</div>
            </a>
        `
    );

    const head_menu = tippy(home_link, {
        theme: 'window',
        content: html.node`
            <div class="setting-group blend">
                ${setting({ id: 'branding_type' })}
            </div>
        `,
        placement: 'right-start',
        trigger: 'manual',
        interactive: true,
        interactiveBorder: 10,
        offset: [0, 0],

        onShow(instance) {
            instance.popper.addEventListener('click', (event) => {
                instance.hide();
            });
        }
    });

    register_menu(home_link, head_menu);

    let link;
    if (update_required === 'false') {
        link = html.node`
            <a class="bleh--version" href="${root}bleh">
                ${version.build}
                <div class="new-badge sku spacing">
                    ${version.sku}
                    ${
                        settings.dev ?
                            html.node`
                    <span class="bleh-icon-container">
                        <span class="bleh-icon" data-type="dev" style="--icon: var(--mask)"/>
                    </span>
                    `
                        :   ''
                    }
                </div>
            </a>
        `;
    } else {
        link = html.node`
            <a class="bleh--version" onclick=${() => prompt_for_update()}>
                <div class="update-container">
                    <div class="bleh-icon" style="--icon: var(--icon-16-update)" />
                </div>
                ${version.build}
                <div class="new-badge sku spacing">
                    ${version.sku}
                    ${
                        settings.dev ?
                            html.node`
                    <span class="bleh-icon-container">
                        <span class="bleh-icon" data-type="dev" style="--icon: var(--mask)"/>
                    </span>
                    `
                        :   ''
                    }
                </div>
            </a>
        `;

        tippy(link, {
            content: tl(trans.update_available_to_install)
        });
    }

    const last_checked = localStorage.getItem('bleh_update_checked') || null;

    const link_menu = tippy(link, {
        theme: 'context-menu',
        content: html.node`
            <a class="dropdown-menu-clickable-item" data-type="update" href="${root}bleh/general">
                ${
                    last_checked ?
                        tl(trans.last_checked_date).replace(
                            '{d}',
                            DateTime.fromJSDate(
                                new Date(last_checked)
                            ).toRelative()
                        )
                    :   tl(trans.never_checked)
                }
            </a>
        `,
        placement: 'right-start',
        trigger: 'manual',
        interactive: true,
        interactiveBorder: 10,
        offset: [0, 0],

        onShow(instance) {
            instance.popper.addEventListener('click', (event) => {
                instance.hide();
            });
        }
    });

    register_menu(link, link_menu);

    masthead_logo.appendChild(link);
}

export function append_nav() {
    if (ff('developer') && !page.structure.indicator) {
        let page_indicator = document.createElement('div');
        page_indicator.classList.add('page-indicator');
        document.documentElement.appendChild(page_indicator);

        page.structure.indicator = page_indicator;
    }

    if (!page.structure.loader) {
        const loader = html.node`
            <div class="loader">
                <div class="loader-bar">
                    <div class="loader-bar-fill" />
                </div>
                <div class="bleh-icon" />
            </div>
        `;
        document.body.appendChild(loader);
        page.structure.loader = loader;
    }

    if (!page.structure.style_warning) {
        const style_warning = html.node`
            <div class="style-warning" style="position: fixed; top: 0; left: 0; right: 0; padding: 20px; background: #fff; z-index: 1000000000; display: flex; align-items: center; gap: 30px">
                <strong>${tl(trans.style_warning)}</strong>
                <button class="btn primary" onclick=${() => {
                    save_setting('branch', 'uwu');
                }}>
                    Reset branch to release (uwu)
                </button>
                <button class="btn-primary" onclick=${() => {
                    save_setting('dev', false);
                    window.location.reload();
                }}>${tl(trans.re_enable_style_loading)}</button>
            </div>
        `;
        document.body.appendChild(style_warning);
        page.structure.style_warning = style_warning;
    }

    const masthead = document.body.querySelector('.masthead');
    const inner = masthead.querySelector('.masthead-inner-wrap');

    const navs = inner.querySelector('.masthead-nav-wrap');

    const search = inner.querySelector('.masthead-search-form');
    const form = search.querySelector('.masthead-search-field');
    form.placeholder = tl(trans.search);
    inner.insertBefore(
        html.node`
        <div class="masthead-search-wrap">
            ${search}
        </div>
    `,
        navs
    );

    // 2025-04-14
    let new_auth = masthead.querySelector('.auth-dropdown-menu');

    let links = masthead.querySelector('.masthead-nav .navlist-items');
    render(links, html``);

    let auth_link = masthead.querySelector(
        '.masthead-nav-wrap > .site-auth .auth-link'
    );
    if (!auth_link) {
        render(
            links,
            html`
                ${() => {
                    const elem = html.node`
                    <li class="masthead-nav-item">
                        <a class="masthead-nav-control chibi" href="${root}bleh" data-label="bleh_no_auth">
                            ${tl(trans.bleh_settings)}
                        </a>
                    </li>
                `;

                    tippy(elem, {
                        content: tl(trans.bleh_settings)
                    });

                    return elem;
                }}
            `
        );

        masthead.appendChild(html.node`
            <div class="mobile-controls">
                <a class="btn mobile-control" data-type="register" href="${root}join">
                    ${tl(trans.sign_up)}
                </a>
                <a class="btn mobile-control" aria-checked=${page.type == 'settings' || page.type == 'bleh_settings'} data-menu-item="settings" href="${root}bleh">
                    ${tl(trans.settings)}
                </a>
                <a class="btn mobile-control" data-type="login" href="${root}login">
                    ${tl(trans.log_in)}
                </a>
            </div>
        `);

        return;
    }

    if (auth_link.hasAttribute('data-bleh')) return;
    auth_link.setAttribute('data-bleh', 'true');

    auth_link.appendChild(html.node`
        <p>${auth.name}</p>
    `);

    let badges = load_badges(auth.name, true);

    if (badges) {
        auth_link.appendChild(create_badge(badges[0], false, false, true));
    } else if (auth.pro) {
        auth_link.appendChild(html.node`
            <span class="label user-status-subscriber auth-badge">${tl(trans.badges['user-status-subscriber'].name)}</span>
        `);
    }

    /*let quick_switcher = html.node`
        <li class="masthead-nav-item">
            <button class="masthead-nav-control" data-type="cmd" onclick=${() => page.state.rabbit()}>
                ${tl(trans.quick_switcher)}
            </button>
        </li>
    `;

    tippy(quick_switcher, {
        content: tl(trans.quick_switcher)
    });

    links.appendChild(quick_switcher);*/

    const more_button = html.node`
        <button class="masthead-nav-control chibi icon" data-type="more">
            ${tl(trans.more)}
        </button>
    `;

    tippy(more_button, {
        content: more_button.textContent
    });

    const more_menu = tippy(more_button, {
        content: html.node`
            <a class="dropdown-menu-clickable-item accent" data-type="discord" href="https://discord.gg/${discord}" target="_blank">
                ${tl(trans.join_discord)}
            </a>
            <button class="dropdown-menu-clickable-item sponsor" onclick=${() => sponsor()}>
                ${tl(trans.sponsor)}
            </button>
            <a class="dropdown-menu-clickable-item lotus" href="https://github.com/katelyynn/lotus/issues/new/choose" target="_blank">
                ${tl(trans.suggest_correction)}
            </a>
            <div class="sep" />
            <a class="dropdown-menu-clickable-item" data-type="update" href="${root}bleh/general">
                ${tl(trans.updates)}
            </a>
            <button class="dropdown-menu-clickable-item" data-menu-item="news" onclick=${() => news()}>
                ${tl(trans.news)}
            </button>
            <a class="dropdown-menu-clickable-item issues" href="https://github.com/katelyynn/bleh/issues" target="_blank">
                ${tl(trans.report_issue)}
            </a>
        `,
        theme: 'menu',
        placement: 'top',
        interactive: true,
        interactiveBorder: 10,
        trigger: 'click',

        onShow(instance) {
            instance.popper.addEventListener('click', (event) => {
                instance.hide();
            });
        }
    });

    links.appendChild(more_button);

    // configure bleh
    let bleh_container = html.node`
            <li class="masthead-nav-item">
                <a class="masthead-nav-control chibi" href="${root}bleh${stored_season.id != 'none' ? '/seasonal' : ''}" data-label="bleh" data-season="${stored_season.id}" data-season-active="${stored_season.id != 'none' ? 'true' : 'false'}">
                    ${stored_season.id == 'none' ? tl(trans.bleh_settings) : DateTime.fromISO(stored_season.end.replace('y0', stored_season.year).replace('{offset}', stored_season.offset)).toRelative(DateTime.fromISO(stored_season.now))}
                </a>
            </li>
        `;
    if (stored_season.id == 'none') {
        tippy(bleh_container, {
            content: tl(trans.bleh_settings)
        });
    } else {
        page.header.season_tooltip = tippy(bleh_container, {
            theme: 'seasonal-swatch',
            content: html.node`
                    <span class="season-colour-name colourful" data-season=${stored_season.id}>${tl(trans.seasonal.listing[stored_season.id])}</span>
                    <span class="season-exclusive">${tl(trans.seasonal.notice)}</span>
                `
        });
    }
    links.appendChild(bleh_container);

    page.header.season = bleh_container.querySelector('a');

    let notif_count = new_auth.querySelector(
        '[data-analytics-label="notifications"] + .auth-avatar-notification-count-badge'
    );
    if (!notif_count) notif_count = '0';
    else notif_count = notif_count.textContent;
    let inbox_count = new_auth.querySelector(
        '[data-analytics-label="inbox"] + .auth-avatar-notification-count-badge'
    );
    if (!inbox_count) inbox_count = '0';
    else inbox_count = inbox_count.textContent;

    const count = parseInt(notif_count) + parseInt(inbox_count);

    // auth menu
    const token = new_auth
        .querySelector('[name="csrfmiddlewaretoken"]')
        .getAttribute('value');
    page.token = token;

    let auth_menu = tippy(auth_link, {
        theme: 'auth-menu-v2',
        content: html.node`
            <a href="${root}user/${auth.name}">${auth.name}</a>
        `,
        placement: 'top',
        interactive: true,
        interactiveBorder: 10,
        trigger: 'click'
    });

    let container = new_auth.parentElement;
    container.parentElement.removeChild(container);
    auth_link.removeAttribute('aria-controls');
    auth_link.removeAttribute('data-disclose-hover');
    auth_link.removeAttribute('data-disclose-hover--allow-enter-open');

    auth_link.addEventListener('click', (e) => {
        const cmd = e.getModifierState('Control') || e.getModifierState('Meta');
        const new_tab = e.button === 1 || cmd;

        // only allow clicking link if new tab action
        if (!new_tab) e.preventDefault();
    });
}
