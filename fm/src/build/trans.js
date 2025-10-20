//
// bwaa, an extension for the music site Last.fm
// Copyright (c) 2025 katelyn and contributors
// Licensed under GPLv3
//

import { handle_error_500 } from '../page';
import { log } from './log';
import { auth, auth_link, setRoot } from './page';
import { Settings } from 'luxon';

// loads your selected language in last.fm
export let lang = 'en';

export let lang_info = {
    en: {
        name: 'English',
        by: ['clairedoll'],
        last_updated: 'latest'
    }
};

export const trans = {};

export function tl(key, replacements = {}) {
    if (!key) {
        log('your key is undefined', 'trans');
        return 'NO_TRANSLATION_FOUND';
    }

    let translation = key[lang] || key.en;

    for (const [placeholder, value] of Object.entries(replacements)) {
        const regex = new RegExp(`{${placeholder}}`, 'g');
        translation = translation.replace(regex, value);
    }

    return translation;
}

function collect_keys(object, prefix, out = []) {
    for (const k in object) {
        const val = object[k];
        const key = prefix ? `${prefix}.${k}` : k;

        if (
            typeof val == 'object' &&
            !Object.keys(lang_info).some((lang) => lang in val)
        ) {
            collect_keys(val, key, out);
        } else {
            out.push(key);
        }
    }

    return out;
}

function get_value_by_path(object, path) {
    return path.split('.').reduce((acc, part) => acc?.[part], object);
}

export function translation_stats() {
    const keys = collect_keys(trans);

    for (const lang of Object.keys(lang_info)) {
        let translated = 0;
        const missing = [];

        for (const key of keys) {
            const value = get_value_by_path(trans, key);
            if (value && value[lang]) {
                translated++;
            } else {
                missing.push(key);
            }
        }

        lang_info[lang].total = keys.length;
        lang_info[lang].translated = translated;
        lang_info[lang].missing = missing.length;
        lang_info[lang].missing_keys = missing;
        lang_info[lang].percent = Math.round((translated / keys.length) * 100);
    }

    log('translation stats', 'trans', 'info', { lang_info });
}

function get_lang() {
    const path = window.location.pathname;
    const segments = path.split('/');
    const lang = segments[1];

    if (/^[a-z]{2}$/.test(lang)) {
        return `/${lang}/`;
    }

    return '/';
}

export function lookup_lang() {
    const logo = document.querySelector('.masthead-logo a');

    if (!logo) {
        handle_error_500();
        return;
    }

    setRoot(get_lang());

    let previous_avi = auth.avatar;
    if (auth_link.state) {
        auth.avatar = auth_link.state.querySelector('img').getAttribute('src');

        if (auth.avatar != previous_avi) {
            let avatar = auth_link.state.querySelector('img');
            avatar.setAttribute('crossorigin', 'anonymous');

            try {
                avatar.addEventListener('load', () => {
                    let thief = new ColorThief();
                    let colour = thief.getColor(avatar);

                    let hsl = rgb_to_hsl(colour[0], colour[1], colour[2]);

                    auth.sets.hue = hsl.h;
                    auth.sets.sat = clamp_sat((hsl.s / 100) * 3);
                    auth.sets.lit = clamp_lit(
                        auth.sets.sat,
                        hsl.l / 100 + 0.35
                    );
                });
            } catch (e) {}
        }
    }
    lang = document.documentElement.getAttribute('lang');

    Settings.defaultLocale = lang;
}
