//
// bwaa, an extension for the music site Last.fm
// Copyright (c) 2025 katelyn and contributors
// Licensed under GPLv3
//

import { html } from 'lighterhtml';
import tippy from 'tippy.js';
import { version } from '../main';
// require page reload
export let reload_pending = {
    state: false
};

// lookup
export let last_lookup;
export let next_lookup;

export let dialogs = {};
export let notifications = {};

tippy.setDefaultProps({
    arrow: false,
    duration: [0, 220],
    offset: [0, 4]
});

/**
 * Current profile auth details
 * @param {string|null} name - Profile name if authorised
 * @param {boolean} pro - Last.fm Pro status
 * @param {boolean} sponsor - Sponsor of the project
 * @param {boolean} sponsor_full - Monthly sponsor of the project
 * @param {string|null} avatar - Profile avatar if present
 * @param {{hue: number, sat: number, lit: number}} sets - Set of colours based on avatar
 */
export let auth = {
    name: null,
    pro: null,
    sponsor: false,
    sponsor_full: false,
    avatar: null,
    sets: {
        hue: 255,
        sat: 1,
        lit: 1
    }
};
export let auth_link = {
    state: ''
};

/**
 * Start of page URL based on language, examples:
 * en: / and jp: /jp/
 *
 *
 * Build a language-aware URL like
 *
 *
 * {root}user = /user or /jp/user
 * @type {string}
 */
export let root = '/';
export function setRoot(data) {
    root = data;
}
// recent activity
export let recent_activity_list = [];

/**
 * Represents the current page state, structure, and any elements
 *
 * @property {string} type - Page type (e.g., user, album, settings)
 * @property {string} subpage - Page type subsection (e.g., overview, library_artists, shoutbox_overview)
 * @property {string} name - Artist/album/track/profile name
 * @property {string} sister - Related artist for album or track
 * @property {Array} sister_others - Featured guests on a track
 * @property {string} avatar - URL for associated avatar
 * @property {boolean} multi - Whether this artist page is a shared profile
 * @property {boolean} corrected - Whether this page has been corrected via lotus
 * @property {string} token - Profile token for submitting forms
 * @property {boolean} mobile - Page is in a mobile state **on load**
 * @property {string} platform - Operating system - can be win32, darwin, ios, android, linux, or other
 * @property {Object} structure - Elements that make up the page structure
 * @property {boolean} structure.glacier.refresh - Whether this glacier library page is pending refresh
 * @property {Object|null} structure.logs - Logging host
 * @property {Object} requested - Any arguments requested in the page URL via ?this=syntax
 * @property {Object} state - Dynamic variables
 * @property {boolean} state.settings_reload - Whether the page is pending a reload due to user settings
 */
export let page = {
    initial: '',
    type: '',
    name: '',
    sister: '',
    sister_others: [],
    subpage: '',
    avatar: '',
    multi: false,
    corrected: false,
    token: '',
    mobile: false,
    platform: 'other',
    suggest: null,
    now: {
        next_fetch: null,
        name: null,
        artist: null,
        album: null,
        avatar: null,
        active: false
    },
    notifications: {
        next_fetch: null,
        list: null
    },
    messages: {
        next_fetch: null,
        list: null
    },
    structure: {
        wrapper: null,
        container: null,
        row: null,
        main: null,
        side: null,
        nav: null,
        content_top: null,
        glacier: {
            refresh: true
        },
        indicator: null,
        logs: null
    },
    requested: {
        tab: null
    },
    header: {},
    state: {
        settings_reload: false,
        glacier: {
            insights: {
                artist: {
                    display: false,
                    values: [],
                    labels: [],
                    highest: {
                        value: 0,
                        label: '',
                        link: '',
                        img: ''
                    }
                },
                album: {
                    display: false,
                    values: [],
                    labels: [],
                    highest: {
                        value: 0,
                        label: '',
                        link: '',
                        img: ''
                    }
                },
                track: {
                    display: false,
                    values: [],
                    labels: [],
                    highest: {
                        value: 0,
                        label: '',
                        link: '',
                        img: ''
                    }
                }
            }
        }
    }
};

export let shout_parse_queue = [];

export const bwaa_url = '{root}bwaa';
export const setup_url = '{root}bwaa/setup';
export const sponsor_url = '{root}bwaa/sponsor';

export const discord = 'xU9KxGQpVw';

export let oracle_artists = {};
export let oracle_albums = {};
export let oracle_tracks = {};

export let has_prompted_for_update = {
    state: false
};

export let theme_preview = () => html.node`
    <div class="preview-inner">
        <div class="preview-card">
            <div class="preview-header">Aa</div>
            <div class="preview-text"></div>
            <div class="preview-text row-2"></div>
            <div class="preview-buttons">
                <div class="preview-button preview-button-primary"></div>
                <div class="preview-button"></div>
                <div class="preview-button preview-track"></div>
            </div>
        </div>
    </div>
`;
