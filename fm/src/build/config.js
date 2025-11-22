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
        default: 'simply_red',
        type: 'radio',
        values: {
            simply_red: {
                name: trans.simply_red
            },
            paint_it_black: {
                en: trans.paint_it_black
            }
        }
    },
    theme_schedule: {
        default: false
    },
    page_style: {
        default: 2012,
        type: 'radio',
        values: {
            2007: {
                name: '2007',
                visible: false
            },
            2008: {
                name: '2008',
                body: trans.page_style_2008,
                visible: false
            },
            2009: {
                name: '2009',
                visible: false
            },
            2010: {
                name: '2010',
                visible: false
            },
            2011: {
                name: '2011',
                visible: false
            },
            2012: {
                name: '2012',
                body: trans.page_style_2012,
                sub: trans.default
            },
            2013: {
                name: '2013',
                body: trans.page_style_2013,
                visible: false
            },
            2014: {
                name: '2014',
                body: trans.page_style_2014,
                visible: false
            }
        }
    },
    dev: {
        default: false,
        title: trans.theme_loading.name,
        body: trans.theme_loading.body
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
    varied_avatar_shapes: {
        default: true,
        title: trans.varied_avatar_shapes.name,
        body: trans.varied_avatar_shapes.body
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
    },
    hide_notifications: {
        default: false,
        title: trans.hide_notifications
    },
    hide_shout_votes: {
        default: false,
        title: trans.hide_shout_votes
    },
    flatten_shout_replies: {
        default: false,
        title: trans.flatten_shout_replies
    },
    show_library: {
        default: true,
        title: trans.show_library,
        new_release: true
    }
};
