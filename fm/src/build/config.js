//
// bwaa, an extension for the music site Last.fm
// Copyright (c 2025 katelyn and contributors
// Licensed under GPLv3
//

import { trans } from './trans.js';

export let settings = {};
export let inbuilt_settings = {
    recent_artwork: {
        css: 'recent_artwork',
        unit: '',
        value: true,
        values: [true, false],
        type: 'toggle'
    },
    recent_realtime: {
        css: 'recent_realtime',
        unit: '',
        value: true,
        values: [true, false],
        type: 'toggle'
    },
    recent_listening: {
        css: 'recent_listening',
        unit: '',
        value: true,
        values: [true, false],
        type: 'toggle'
    },
    disable_shoutbox: {
        css: 'disable_shoutbox',
        unit: '',
        value: true,
        values: [true, false],
        type: 'toggle'
    },
    edit_all: {
        css: 'edit_all',
        unit: '',
        value: true,
        values: [true, false],
        type: 'toggle'
    },
    create_automatic_edit_rule: {
        css: 'create_automatic_edit_rule',
        unit: '',
        value: true,
        values: [true, false],
        type: 'toggle'
    },
    marketing_emails: {
        css: 'marketing_emails',
        unit: '',
        value: true,
        values: [true, false],
        type: 'toggle'
    }
};

export let settings_store = {
    theme: {
        default: 'darker',
        type: 'radio',
        title: trans.theme
    },
    theme_schedule: {
        default: false
    },
    theme_day: {
        default: 'light',
        type: 'select',
        title: trans.theme_day.name,
        body: trans.theme_day.body,
        incompatible: { theme_schedule: false },
        hide_if_incompatible: true
    },
    theme_night: {
        default: 'darker',
        type: 'select',
        title: trans.theme_night.name,
        body: trans.theme_night.body,
        incompatible: { theme_schedule: false },
        hide_if_incompatible: true
    },
    page_style: {
        default: 2012,
        type: 'radio',
        values: {
            2012: {
                name: '2012'
            }
        }
    },
    dev: {
        default: false,
        title: trans.theme_loading.name,
        body: trans.theme_loading.body
    },
    underline_links: {
        default: false,
        title: trans.underline_links.name,
        body: trans.underline_links.body
    },
    corrections: {
        default: true,
        title: trans.correct_titles_with_lotus.name,
        body: trans.correct_titles_with_lotus.body,
        require_reload: true
    },
    feature_flags: {
        default: {},
        type: 'other'
    },
    shout_markdown: {
        default: true,
        require_reload: 'partial',
        title: trans.markdown_shouts.name,
        body: trans.markdown_shouts.body
    },
    bio_markdown: {
        default: true,
        require_reload: 'partial',
        title: trans.markdown_profiles.name,
        body: trans.markdown_profiles.body
    },
    seasonal: {
        default: true,
        title: trans.enable_seasons.name,
        body: trans.enable_seasons.body,
        require_reload: true
    },
    seasonal_accent: {
        default: true,
        title: trans.seasonal_accent
    },
    seasonal_particles: {
        default: 'all',
        type: 'radio',
        title: trans.seasonal_particles.name,
        body: trans.seasonal_particles.body,
        values: {
            all: {
                name: trans.all_particles
            },
            less: {
                name: trans.less_particles
            },
            none: {
                name: trans.no_particles
            }
        }
    },
    seasonal_particles_fps: {
        default: false,
        type: 'checkbox',
        title: trans.seasonal_particles_fps.name,
        body: trans.seasonal_particles_fps.body
    },
    seasonal_overlays: {
        default: true,
        type: 'checkbox',
        title: trans.seasonal_overlays.name,
        body: trans.seasonal_overlays.body
    },
    hu_tao: {
        default: '',
        type: 'text',
        max: 40,
        placeholder: trans.enter_password
    },
    activities: {
        default: true,
        title: trans.activity_tracking.name,
        body: trans.activity_tracking.body
    },
    activity_shout: {
        default: true,
        title: trans.shouts,
        body: trans.activity.types.shout,
        type: 'checkbox',
        icon: 'icon-16-shoutbox',
        horizontal: true
    },
    activity_image: {
        default: true,
        title: trans.photos,
        body: trans.activity.types.image,
        type: 'checkbox',
        icon: 'icon-16-gallery-vertical',
        horizontal: true
    },
    activity_obsess: {
        default: true,
        title: trans.obsessions,
        body: trans.activity.types.obsess,
        type: 'checkbox',
        icon: 'icon-16-obsession',
        horizontal: true
    },
    activity_love: {
        default: true,
        title: trans.loved,
        body: trans.activity.types.love,
        type: 'checkbox',
        icon: 'icon-16-heart',
        horizontal: true
    },
    activity_bookmark: {
        default: true,
        title: trans.bookmarks,
        body: trans.activity.types.bookmark,
        type: 'checkbox',
        icon: 'icon-16-bookmark',
        horizontal: true
    },
    activity_wiki: {
        default: true,
        title: trans.wiki,
        body: trans.activity.types.wiki,
        type: 'checkbox',
        icon: 'icon-16-bio',
        horizontal: true
    },
    activity_install: {
        default: true,
        title: trans.installation,
        body: trans.activity.types.install,
        type: 'checkbox',
        icon: 'icon-16-download',
        horizontal: true
    },
    prefer_no_redirect: {
        default: true,
        title: trans.prefer_no_redirect.name,
        body: trans.prefer_no_redirect.body
    },
    inbox_view: {
        default: 'notifications',
        type: 'tabs',
        values: {
            notifications: {
                name: trans.notifications
            },
            messages: {
                name: trans.messages
            }
        }
    },
    navigation_items: {
        default: ['home', 'library', 'shouts'],
        type: 'list',
        title: trans.navigation_items.name,
        body: trans.navigation_items.body,
        predefined: true
    },
    navigation_language: {
        default: true,
        type: 'checkbox',
        title: trans.navigation_language
    },
    branding_type: {
        default: 'bleh',
        type: 'radio',
        title: trans.branding_type.name,
        body: trans.branding_type.body,
        values: {
            bleh: {
                name: 'bleh'
            },
            lastfm: {
                name: 'Last.fm'
            }
        }
    },
    trusted_sites: {
        default: [],
        type: 'list'
    },
    friends: {
        default: [],
        type: 'list',
        title: trans.friends,
        body: trans.friends_setting,
        warn_if_matches_auth: true
    },
    starred_friend: {
        default: '',
        type: 'select',
        title: trans.starred_friend.name,
        body: trans.starred_friend.body
    },
    dismissed: {
        default: [],
        type: 'list'
    },
    oracle_beta: {
        default: false,
        title: trans.oracle_beta.name,
        body: trans.oracle_beta.body,
        beta: true,
        new_release: true
    },
    control_center: {
        default: [],
        type: 'list'
    },
    romanise_jp: {
        default: false,
        type: 'checkbox',
        title: trans.romanise_jp,
        new_release: true,
        incompatible: { format_guest_features: false, corrections: false }
    },
    romanise_ko: {
        default: false,
        type: 'checkbox',
        title: trans.romanise_ko,
        new_release: true,
        incompatible: { format_guest_features: false, corrections: false }
    },
    branch: {
        default: 'uwu',
        type: 'text',
        max: 20,
        title: trans.branch.name,
        body: trans.branch.body,
        warn_if_empty: true
    }
};
