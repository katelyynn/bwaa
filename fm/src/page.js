//
// bwaa, an extension for the music site Last.fm
// Copyright (c) 2025 katelyn and contributors
// Licensed under GPLv3
//

export function bwaa() {
    let head_observer = new MutationObserver((mutations) => {
        if (document.head) {
            append_style();
            favi();
            document.title = '...';

            head_observer.disconnect();
        }
    });

    head_observer.observe(document.documentElement, {
        childList: true
    });

    let pre_observer = new MutationObserver((mutations) => {
        if (document.body)
            log(`${JSON.stringify(document.body.classList)}`, 'load');

        if (document.body && document.body.querySelector('.adaptive-skin-container') && document.body.querySelector('.footer')) {
            bwaa_main();
            favi();

            pre_observer.disconnect();
        }
    });

    pre_observer.observe(document.documentElement, {
        childList: true
    });
}

function bwaa_main() {
    let performance_start = performance.now();

    auth_link.state = document.querySelector('a.auth-link');
    if (auth_link.state)
        auth.name = auth_link.state.querySelector('img').getAttribute('alt');

    load_settings();

    // messaging
    load_dialogs();

    try {
        lookup_lang();

        theme_version.state = getComputedStyle(document.body).getPropertyValue('--version-build').replaceAll("'", '').replaceAll('"', ''); // remove quotations

        update_check(false, null, update_masthead);
        patch_masthead();

        load_notifications();

        // load seasonal data
        set_season();

        start_rain();

        load_activities();
        notify_if_new_update();

        lotus();
        sponsors();

        //throw new Error;
        main_flow();

        // last.fm is a single page application
        const observer = new MutationObserver((mutations) => {
            if (
                mutations[0].addedNodes[0] && mutations[0].addedNodes.length == 0 && mutations[0].addedNodes[0].nodeType == 1 && mutations[0].addedNodes[0].hasAttribute('data-tippy-root')
            ) {
                return;
            }

            log('loop', 'mutation', 'log', {mutations: mutations});
            lookup_lang();
            patch_masthead(document.body);

            main_flow();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        let performance_end = performance.now();
        log(`finished in ${performance_end - performance_start}`, 'load');
    } catch(e) {
        handle_error(e);
    }
}

function handle_error(e = null) {
    document.body.classList.add('bleh-loaded');

    dialog({
        id: 'error',
        title: 'An error has occurred',
        body: html.node`
            <div class="modal-vertical-inner error-inner">
                <div class="bleh-icon" style="--icon: var(--icon-error)"></div>
                <h1>oops.. something broke</h1>
                <p>An error prevented ${version.brand} from finishing loading, it's recommended to leave the page and refresh.</p>
                <pre class="error-info">${(e) ? html.node`<span class="error-type">${e.name}</span>: ${e.message}` : ''}${e.stack ? html.node`<br><span class="error-stack">${e.stack}</span>` : ''}<br>on: ${page.type}/${page.subpage}<br>    ${window.location.pathname}<br>    ${version.build}</pre>
                <p>It would be helpful if you could report this bug on Github, including the error message above.</p>
            </div>
            <div class="modal-footer">
                <div class="fill"></div>
                <a class="see-more" href="https://github.com/katelyynn/bleh/issues/new/choose" target="_blank">
                    Report bug now
                </a>
                <div class="fill"></div>
            </div>
        `,
        type: 'error'
    });

    if (e != null) {
        log('fatal failure', 'load');
        console.error('\n\n%cBLEH ERROR', 'font-size: 30px; color: aqua; text-shadow: 0 0 20px white', e, 'BLEH ERROR ABOVE\n^\n^\n^\n^\n^\n^\n^');
    }

    log('current page', 'page', 'info', page);
}

export function handle_error_500() {
    document.body.classList.add('bleh-loaded');
    log('halted as root is inaccessible', 'load');
}

function main_flow() {
    assign_page();

    if (page.state.error) return;

    if (page.type == 'artist' || page.type == 'album') {
        bleh_gallery();
        bleh_gallery_upload_check();
    }

    if (page.type == 'user' ||
        page.type == 'search' ||
        page.type == 'tag' ||
        page.type == 'events'
    )
        music_grids();

    if (page.type == 'user' ||
        page.type == 'artist' ||
        page.type == 'album' ||
        page.type == 'track' ||
        page.type == 'events' ||
        page.type == 'festival' ||
        page.type == 'tag'
    ) {
        patch_shouts();

        if (shout_parse_queue.length > 0) parse_shout_queue();
    }

    if (page.type == 'user' && page.subpage.startsWith('library') && (
        page.subpage != 'library_overview' && !page.subpage.startsWith('library_artist_') &&
        !page.subpage.startsWith('library_album_') && !page.subpage.startsWith('library_track_')
    ))
        bleh_glacier_library();

    // bulk edit check
    if (auth.pro && page.type == 'user' && page.name == auth.name && page.subpage == 'library_artist_overview' ||
        page.subpage == 'library_album_overview' || page.subpage == 'library_track_overview'
    ) {
        bleh_glacier_library_bulk_edit();
    }

    if (page.type == 'user' ||
        page.type == 'artist' ||
        page.type == 'album' ||
        page.type == 'events' ||
        page.type == 'festival' ||
        page.type == 'tag' ||
        page.type == 'overview' ||
        page.type == 'bookmarks'
    ) {
        patch_titles();
    }

    if (settings.corrections) {
        correct_generic_combo('resource-list--release-list-item');
        correct_generic_combo('similar-albums-item');
        correct_generic_combo('track-similar-tracks-item');
        correct_generic_combo('similar-items-sidebar-item');

        if (page.type == 'bookmarks' || page.type == 'releases') {
            correct_generic_artist('music-bookmarks-artists-item');
            correct_generic_combo('music-bookmarks-albums-item');
        }
    }

    if (page.type == 'overview' && page.subpage == 'music') {
        let items = page.structure.main.querySelectorAll('.music-featured-item:not(.music-featured-tag, [data-passed="true"])');
        items.forEach(item => {
            item.setAttribute('data-passed', 'true');

            const bg = item.querySelector('.music-featured-item-background');
            if (!bg) return;

            let style = bg.style.getPropertyValue('background-image');
            if (!style)
                style = bg.style.getPropertyValue('background');
            let cover_substr = style.indexOf('url');
            let cover = style.substring(cover_substr);

            bg.style.setProperty('background', cover);
        });
    }

    shout_messages();

    subscribe_to_events();

    dialog_extender();
}

function assign_page() {
    document.documentElement.classList.add('bleh-supports-loading');
    if (!page.structure.wrapper)
        page.structure.wrapper = document.body.querySelector('.main-content');

    let main_content = page.structure.wrapper.querySelector(':scope > :last-child:not([data-bleh])');
    if (main_content) {
        auth.pro = !!main_content.querySelector(':scope > .masthead > .masthead-pro-wrap');

        assign_page_type();
        load_page();
        main_content.setAttribute('data-bleh', 'true');
    } else {
        assign_page_subpage();
    }

    document.body.classList.add('bleh-loaded');
}

function assign_page_type() {
    let page_classes = document.body.classList;
    page_classes.forEach((page_class, index) => {
        if (page_class.startsWith('namespace')) {
            page.initial = page_class.replace('namespace--', '');
            let page_split = page.initial.split('_');

            page.type = page_split[0];
            if (page.type == 'music') {
                page.type = page_split[1];
            }

            if (page.type != last_page_type.state) {
                last_page_type.state = page.type;
                log(page.type, 'page');
            }

            console.log(page);

            assign_page_subpage();

            return;
        }

        if (index > 4)
            return;
    });
}

function assign_page_subpage() {
    page.subpage = page.initial.replace(page.type, '').replace('_', '').replace('music_', '').replace('festival_', 'event_');

    if (last_page_subpage.state != page.subpage) {
        last_page_subpage.state = page.subpage;
        log(`subpage of ${page.subpage}`, 'page');

        load_settings();

        if (page.state.settings_reload) {
            page.state.settings_reload = false;
        }

        if (page.structure.indicator)
            page_indicator();
    }
}

function load_page() {
    //hideAll({duration: 0});

    page.structure.notifications.setAttribute('data-auth-open', 'false');

    set_season();
    seasonal_timer_end();

    bleh_footer();

    let masthead = document.body.querySelector('.masthead');
    window.addEventListener('scroll', (e) => {
        detect_scroll();
    });

    detect_scroll();

    function detect_scroll() {
        const scroll = window.scrollY;

        return;

        if (scroll > 30)
            masthead.classList.add('scrolled');
        else
            masthead.classList.remove('scrolled');
    }

    detect_mobile();
    page.platform = detect_platform();

    if (window.location.pathname.startsWith(setup_url.replace('{root}', root))) {
        bleh_setup();
    } else if (window.location.pathname.startsWith(sponsor_url.replace('{root}', root))) {
        bleh_sponsor_page();
    } else if (window.location.pathname.startsWith(api_url.replace('{root}', root))) {
        bleh_auth();
    } else if (window.location.pathname.startsWith(mualani_url.replace('{root}', root))) {
        mualani();
    } else if (window.location.pathname.startsWith(minis_url.replace('{root}', root))) {
        page.type = 'minis';
        bleh_home();
        bleh_minis();
    } else if (window.location.pathname.startsWith(bleh_url.replace('{root}', root))) {
        page.type = 'bleh_settings';
        bleh_home();
        bleh_settings();
    } else {
        bleh_error();

        if (page.state.error) {
            append_nav();
            page_title();
            return;
        }

        if (page.type == 'user' ||
            page.type == 'artist' ||
            page.type == 'album' ||
            page.type == 'track'
        ) {
            nag_bar();
        }

        if (settings.corrections) {
            if (page.type == 'artist') {
                correct_generic_combo_no_artist('artist-header-featured-items-item');
                correct_generic_combo_no_artist('artist-top-albums-item');
            } else if (page.type == 'track') {
                correct_generic_combo('source-album-details');
            }
        }

        if (page.type == 'user')
            bleh_profiles();
        else if (page.type == 'artist')
            bleh_artists();
        else if (page.type == 'album')
            bleh_albums();
        else if (page.type == 'track')
            bleh_tracks();
        else if (page.type == 'events' || page.type == 'festival')
            bleh_events();
        else if (page.type == 'tag')
            bleh_tags();
        else if (page.type == 'search')
            bleh_search();
        else if (page.type == 'inbox')
            bleh_inbox();
        else if (page.type == 'home')
            bleh_home_legacy();
        else if (page.type == 'overview' || page.type == 'recommended' || page.type == 'releases' || page.type == 'bookmarks' || page.type == 'charts' || page.type == 'settings')
            bleh_home();
        else if (page.type == 'api')
            bleh_api();
        else if (page.type == 'labs')
            bleh_labs();

        if (page.type == 'user' || page.type == 'events') {
            bleh_users();
        }

        if (
            (page.type == 'artist' || page.type == 'album' || page.type == 'track' || page.type == 'tag') &&
            page.subpage == 'overview'
        )
            patch_wiki();

        if ((page.type == 'user' || page.type == 'tag' || page.type == 'events') && (page.subpage == 'overview' || page.subpage == 'event_overview'))
            bleh_radio();

        if (page.subpage == 'images_overview') {
            let sort_button = page.structure.main.querySelector('.dropdown-menu-clickable-button');
            let sort_menu = page.structure.main.querySelector('.dropdown-menu-clickable');

            if (sort_button && sort_menu) {
                page.structure.main.insertBefore(html.node`
                    <div class="dropdown-top-wrap">
                        ${sort_button}
                        ${sort_menu}
                    </div>
                `, page.structure.main.firstElementChild);
            }
        }

        if (page.subpage == 'image') {
            let images = page.structure.row.querySelectorAll('.gallery-image');
            images.forEach(image => {
                let star = image.querySelector('.gallery-image-preferred-container');
                if (!star) return;

                render(star, html`
                    <div class="bleh-icon" />
                    ${tl(trans.starred)}
                `);
            });
        }

        if (['artist', 'album', 'track', 'user', 'tag'].includes(page.type)) {
            if (!['user', 'tag'].includes(page.type) && page.subpage.startsWith('shoutbox'))
                shout_header(page.structure.main.querySelector('.section-controls'));
            else if (page.subpage == 'overview' || page.subpage == 'image')
                shout_header(page.structure.main.querySelector('.shoutbox'));
        }
    }

    append_nav();

    page_title();
}

function page_title() {
    if (ff('page_title')) {
        let template = tl(trans.page_templates.type);
        if (!page.state.error) {
            if ((page.type == 'user' || page.type == 'artist' || page.type == 'events' || page.type == 'tag') && page.subpage != 'home')
                template = tl(trans.page_templates.name_type)
            else if (page.type == 'album' || page.type == 'track')
                template = tl(trans.page_templates.name_sister_type);
        }

        let name = page.name;
        let sister = page.sister;

        if (page.type == 'album' || page.type == 'track') {
            name = correct_item_by_artist(name, sister);
            sister = correct_artist(sister);
        } else if (page.type == 'artist') {
            name = correct_artist(name);
        }

        let title;
        if (page.subpage != 'overview' && page.subpage != 'event_overview' && page.subpage != 'home' && (page.type == 'user' || page.type == 'artist' || page.type == 'album' || page.type == 'track' || page.type == 'events' || page.type == 'tag'))
            title = tl(trans[page.subpage]);

        if (page.type == 'settings' || page.type == 'bleh_settings')
            title = tl(trans.settings);
        else if (page.type == 'bleh_setup')
            title = tl(trans.bleh_setup);
        else if (page.type == 'bleh_sponsor')
            title = tl(trans.sponsor);
        else if (page.type == 'search')
            title = tl(trans.search);
        else if (page.type == 'overview' || page.type == 'home')
            title = tl(trans.home);
        else if (page.type == 'recommended')
            title = tl(trans.recommendations);
        else if (page.type == 'releases')
            title = tl(trans.releases);
        else if (page.type == 'events' && page.subpage == 'home')
            title = tl(trans.events);
        else if (page.type == 'bookmarks')
            title = tl(trans.bookmarks);
        else if (page.type == 'charts')
            title = tl(trans.charts);
        else if (page.type == 'labs')
            title = tl(trans.labs.name);
        else if (page.type == 'minis')
            title = tl(trans.minis);

        if (page.type == 'inbox') {
            if (page.subpage == 'notifications')
                title = tl(trans.notifications);
            else
                title = tl(trans.messages);
        }

        if (page.subpage.replace('event_', '').startsWith('shoutbox'))
            title = tl(trans.shouts);
        else if (page.subpage.startsWith('library'))
            title = tl(trans.library);
        else if (page.subpage == 'obsessions_overview')
            title = tl(trans.obsessions);
        else if (page.subpage == 'obsessions_obsession')
            title = tl(trans.obsession);
        else if (page.subpage.startsWith('tags'))
            title = tl(trans.tags);
        else if (page.subpage.startsWith('listening-report'))
            title = tl(trans.reports);
        else if (page.subpage.startsWith('event_attendance'))
            title = tl(trans.attendance);
        else if (page.subpage == 'event_lineup')
            title = tl(trans.lineup);
        else if (page.subpage == 'playlists_playlists')
            title = tl(trans.playlists);
        else if (page.subpage == 'auth')
            title = tl(trans.connect_app);
        else if (page.subpage.startsWith('image') && page.type == 'artist')
            title = tl(trans.photos);
        else if (page.subpage.startsWith('image') && page.type == 'album')
            title = tl(trans.artwork);
        else if (page.subpage.startsWith('listeners'))
            title = tl(trans.listeners);
        else if (page.subpage == 'similar')
            title = tl(trans.similar_artists);
        else if (page.subpage.startsWith('wiki'))
            title = tl(trans.wiki);

        if (page.subpage == 'overview' || page.subpage == 'event_overview') {
            if (page.type == 'user')
                title = tl(trans.profile);
            else if (page.type == 'artist')
                title = tl(trans.artist);
            else if (page.type == 'album')
                title = tl(trans.album);
            else if (page.type == 'track')
                title = tl(trans.track);
            else if (page.type == 'events')
                title = tl(trans.event);
            else if (page.type == 'tag')
                title = tl(trans.tag);
        }

        if (page.state.error)
            title = tl(trans.error);

        template = template
        .replace('{page}', title)
        .replace('{name}', name)
        .replace('{sister}', sister)
        .replace('{build}', version.build)
        .replace('{sku}', version.sku);

        if (settings.branding_type == 'bleh')
            template = template.replace('{brand}', version.brand);
        else if (settings.branding_type == 'lastfm')
            template = template.replace('{brand}', `Last.fm (${version.brand})`);

        document.title = template;
    }

    if (page.structure.indicator)
        page_indicator();
}

function detect_mobile() {
    if (window.innerWidth <= 600) {
        page.mobile = true;

        let theme = document.createElement('meta');
        theme.setAttribute('name', 'theme-color');
        theme.setAttribute('content', '#000000');
        document.head.appendChild(theme);

        let icon = document.head.querySelector('[rel="apple-touch-icon"]');
        icon.setAttribute('href', 'https://github.com/katelyynn/bleh/raw/uwu/fm/app.png');

        let capable = document.createElement('meta');
        capable.setAttribute('name', 'apple-mobile-web-app-capable');
        capable.setAttribute('content', 'yes');
        document.head.appendChild(capable);

        let manifest = document.createElement('link');
        manifest.setAttribute('rel', 'manifest');
        manifest.setAttribute('href', 'https://github.com/katelyynn/bleh/raw/uwu/fm/app.webmanifest');
        document.head.appendChild(manifest);
    } else {
        page.mobile = false;
    }
}

function detect_platform() {
    const platform =
        navigator.userAgentData?.platform || navigator.platform || '';
    const ua = navigator.userAgent || '';
    if (/^Win/i.test(platform)) {
        return 'win32';
    } else if (/^Mac/i.test(platform)) {
        return 'darwin';
    } else if (/iP(hone|ad|od)/i.test(ua)) {
        return 'ios';
    } else if (/Android/i.test(ua)) {
        return 'android';
    } else if (/^Linux/i.test(platform) || /Linux/i.test(ua)) {
        return 'linux';
    } else {
        return 'other';
    }
}

function page_indicator() {
    render(page.structure.indicator, html`
        <div class="bleh">
            <strong>ver</strong>
            <span>${version.brand}</span>
            <span>${version.build}</span>
            <span>${version.sku}</span>
        </div>
        <div class="page">
            <strong>auth</strong>
            <span>${auth.name}</span>
            <span>${lang}</span>
        </div>
        <div class="page">
            <strong onclick=${() => console.info(page)}>page</strong>
            <span>${page.type}</span>
            <span>${page.subpage}</span>
        </div>
        <div class="page">
            <strong></strong>
            <span>${page.name}</span>
            <span>${page.sister}</span>
        </div>
        <div class="page">
            <strong>season</strong>
            <span>${stored_season.id}</span>
            <span>${stored_season.year}</span>
            <span>${stored_season.offset}</span>
        </div>
    `);
}


export function update_page() {
    page.structure.container.setAttribute('data-page-type', page.type);
    page.structure.container.setAttribute('data-page-subpage', page.subpage);
}


function favi() {
    const icon = "https://katelyynn.github.io/bwaa/fm/res/favicon.2.ico";

    const favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) return;

    favicon.href = icon;

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function() {
        favicon.href = icon;
    });
}
