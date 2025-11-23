//
// bwaa, an extension for the music site Last.fm
// Copyright (c) 2025 katelyn and contributors
// Licensed under GPLv3
//

import { settings } from './build/config';
import { auth, page, root } from './build/page';
import { tl, trans, lang } from './build/trans';
import { ff } from './sku';
import { html, render } from 'lighterhtml';
import { save_setting } from './components/settings.js';
import tippy from 'tippy.js';
import { sponsor } from './sponsor.js';
import { version } from './main.js';

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

    // 2025-04-14
    let new_auth = masthead.querySelector('.auth-dropdown-menu');

    let links = masthead.querySelector('.masthead-nav .navlist-items');
    render(links, html`
        <li class="masthead-nav-item">
            <a class="masthead-nav-control" href="${root}music">${tl(trans.music)}</a>
        </li>
        <li class="masthead-nav-item">
            <a class="masthead-nav-control" href="${root}radio">${tl(trans.radio)}</a>
        </li>
        <li class="masthead-nav-item">
            <a class="masthead-nav-control" href="${root}events">${tl(trans.events)}</a>
        </li>
        <li class="masthead-nav-item">
            <a class="masthead-nav-control" href="${root}charts">${tl(trans.charts)}</a>
        </li>
        <li class="masthead-nav-item">
            <a class="masthead-nav-control" href="https://support.last.fm" target="_blank">${tl(trans.community)}</a>
        </li>
        <li class="masthead-nav-item">
            <a class="masthead-nav-control" onclick=${() => sponsor()}>${tl(trans.sponsor_text)}</a>
        </li>
    `);


    const selected_language = document.querySelector(
        '.footer-language--active strong'
    )?.textContent;
    const language_options = document.querySelectorAll('.footer-language-form');

    language_options.forEach(option => {
        const btn = option.querySelector('button');
        if (!btn) return;

        btn.classList = 'language-menu-item';
    });

    inner.appendChild(html.node`
        <div class="search-companion-nav">
            ${() => {
                let dialog_open = false;

                const wrapper = html.node`
                    <span class="language-wrapper" data-dialog-open=${dialog_open}>
                        <a onclick=${() => {
                            dialog_open = !dialog_open;
                            wrapper.setAttribute('data-dialog-open', dialog_open);
                        }} name=${lang}>
                            ${selected_language?.trim()}
                        </a>
                        <div class="language-menu">
                            ${language_options}
                        </div>
                    </span>
                `;

                return wrapper;
            }} |
             ${() => {
                const to_display = settings.theme == 'paint_it_black' ? 'simply_red' : 'paint_it_black';

                const elem = html.node`
                    <a onclick=${() => {
                        const to_save = settings.theme == 'simply_red' ? 'paint_it_black' : 'simply_red';
                        const to_display = to_save == 'paint_it_black' ? 'simply_red' : 'paint_it_black';

                        save_setting('theme', to_save);
                        elem.textContent = tl(trans[to_display]);
                    }} title=${tl(trans.switch_colour_style)}>
                        ${tl(trans[to_display])}
                    </a>
                `;

                return elem;
            }} |
             <a href="${root}help">${tl(trans.help)}</a>
        </div>
    `);


    const site_auth = masthead.querySelector('.masthead-nav-wrap > .site-auth');
    const auth_link = site_auth?.querySelector(':scope > .auth-link');
    if (!auth_link) return;

    auth_link.appendChild(html.node`
        <p>${auth.name}</p>
    `);

    let notif_count = new_auth.querySelector(
        '[data-analytics-label="notifications"] + .auth-avatar-notification-count-badge'
    );
    if (!notif_count) notif_count = 0;
    else notif_count = parseInt(notif_count.textContent);
    let inbox_count = new_auth.querySelector(
        '[data-analytics-label="inbox"] + .auth-avatar-notification-count-badge'
    );
    if (!inbox_count) inbox_count = 0;
    else inbox_count = parseInt(inbox_count.textContent);

    site_auth.appendChild(html.node`
        <div class="user-companion-nav">
             <a href="${root}inbox/notifications">${tl(trans.notifications)}${notif_count > 0 ? ` (${notif_count})` : ''}</a>
             <div class="user-companion-sep" />
             <a href="${root}inbox">${tl(trans.inbox)}${inbox_count > 0 ? ` (${inbox_count})` : ''}</a>
             <div class="user-companion-sep" />
             <a href="${root}logout">${tl(trans.logout)}</a>
        </div>
    `);

    // auth menu
    const token = new_auth
        .querySelector('[name="csrfmiddlewaretoken"]')
        .getAttribute('value');
    page.token = token;

    let auth_menu = tippy(auth_link, {
        theme: 'auth-menu-v2',
        content: html.node`
            <a class="auth-dropdown-menu-item" href="${root}">${tl(trans.home)}</a>
            <a class="auth-dropdown-menu-item" href="${root}user/${auth.name}">${tl(trans.profile)}</a>
            <a class="auth-dropdown-menu-item" href="${root}music">${tl(trans.recommended)}</a>
            <a class="auth-dropdown-menu-item" href="${root}user/${auth.name}/library">${tl(trans.library)}</a>
            <a class="auth-dropdown-menu-item" href="${root}user/${auth.name}/events">${tl(trans.events)}</a>
            <a class="auth-dropdown-menu-item" href="${root}settings">${tl(trans.settings)}</a>
            <a class="auth-dropdown-menu-item" href="${root}bwaa">${version.brand}</a>
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
        const new_tab = e.button == 1 || cmd;

        // only allow clicking link if new tab action
        if (!new_tab) e.preventDefault();
    });
}
