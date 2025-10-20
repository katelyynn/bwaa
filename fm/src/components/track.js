//
// bwaa, an extension for the music site Last.fm
// Copyright (c) 2025 katelyn and contributors
// Licensed under GPLv3
//

import { html, render } from 'lighterhtml';
import { settings } from '../build/config';
import { log } from '../build/log';
import { auth, page, root } from '../build/page';
import {
    clamp_lit,
    clamp_sat,
    copy,
    return_artist_from_track,
    rgb_to_hsl,
    romanise,
    sanitise
} from '../build/tools';
import { patch_artist_ranks_in_list_view } from './colourful_counts';
import {
    correct_artist,
    correct_item_by_artist,
    name_includes,
    smart_artists,
    smart_title
} from './lotus';
import { register_menu } from './menu';
import { tl, trans } from '../build/trans.js';
import { notify } from './notify.js';
import { redirect } from './music.js';
import tippy from 'tippy.js';
import { hoshino } from './hoshino.js';

export function patch_titles(search = page.structure.main) {
    if (page.subpage == 'tags_overview') return;

    if (!search) {
        log(
            'tracks could not be searched as search was undefined',
            'tracks',
            'log',
            { search }
        );
        return;
    }

    const tracklists = search.querySelectorAll(
        '.chartlist:not(.chartlist__placeholder)'
    );

    tracklists.forEach((tracklist) => {
        if (!tracklist) return;

        log('found, checking', 'tracks', 'log', { tracklist, search });

        // used to ensure this hasnt been run thru
        if (
            tracklist.querySelector(
                'tbody > .chartlist-row:first-child > .kate-placeholder'
            )
        )
            return;

        log('new!', 'tracks', 'info', { tracklist });

        const wide = tracklist.classList.contains(
            'chartlist--wide-artist-column'
        );

        const tracks = tracklist.querySelectorAll(
            ':is(.chartlist-row:not(.chartlist__placeholder-row), .chartlist-row--interlist-ad)'
        );

        tracks.forEach((track, index) => {
            smart_track(track, index);
        });

        function smart_track(track, index) {
            console.log('track', track);
            if (track.getAttribute('data-track-type')) return;

            // ads slowly move up the tree until eventually causing a crash
            if (track.classList[0] == 'chartlist-row--interlist-ad') {
                track.parentElement.removeChild(track);
                return;
            }

            track.style.setProperty('--delay', index * 0.04 + 's');
            track.appendChild(html.node`
                <div class="kate-placeholder" />
            `);

            let track_title = track.querySelector(
                '.chartlist-name a:not(.offset-section-anchor)'
            );
            if (!track_title) return;

            if (track_title.hasAttribute('title')) {
                track_title.setAttribute(
                    'data-name',
                    track_title.getAttribute('title')
                );
                track_title.removeAttribute('title');
            }

            // for albums and tracks 'avatar' is replaced with 'cover-art'
            // we can use this to detect if the item is either a user or an artist
            let is_user = track.querySelector('.chartlist-image .avatar');
            let is_artist = false;

            // now lets check if we have a user or an artist
            if (is_user) {
                let link = track_title.getAttribute('href');
                if (link.startsWith(`${root}music/`)) {
                    // this is an artist
                    is_user = false;
                    is_artist = true;
                }
            }

            const track_type = track.querySelector(':scope > .chartlist-type');
            if (
                track_type &&
                track_type.classList[1] == 'chartlist-type--artist'
            ) {
                is_user = false;
                is_artist = true;
            }

            log(
                `is user: ${is_user}, is artist: ${is_artist}`,
                'tracks',
                'log'
            );

            if (is_user) {
                track.setAttribute('data-track-type', 'user');

                if (settings.colourful_counts)
                    patch_artist_ranks_in_list_view(track);

                log('finished user stuff, returning', 'tracks', 'log');
                return;
            }

            if (is_artist) {
                track.classList.remove('chartlist-row--with-artist');
                track.setAttribute('data-track-type', 'artist');

                if (settings.corrections)
                    track_title.textContent = correct_artist(
                        track_title.getAttribute('data-name')
                    );

                return;
            }

            let is_album = track.hasAttribute('data-album-row');
            if (is_album) track.classList.add('bleh--is-album');

            let track_artist = return_artist_from_track(
                track_title.getAttribute('href'),
                is_album
            );
            log(
                `returned ${track_artist} from url ${track_title.getAttribute('href')}`,
                'track'
            );
            // when focused on a track in a library, an artist field is redundant
            if (!wide) track.classList.add('chartlist-row--with-artist');

            const is_active = track.classList.contains(
                'chartlist-row--now-scrobbling'
            );
            const has_bar = track.querySelector(':scope > .chartlist-bar');

            // menu
            let track_timestamp = track.querySelector(
                '.chartlist-timestamp span'
            );
            let track_timestamp_contents;
            if (track_timestamp && !is_active) {
                track_timestamp_contents =
                    track_timestamp.getAttribute('title');

                if (track_timestamp_contents) {
                    track_timestamp.setAttribute('title', '');

                    tippy(track_timestamp, {
                        content: track_timestamp_contents
                    });
                }
            }

            let album = track.querySelector('.chartlist-album a');
            if (!is_album && album)
                album.textContent = correct_item_by_artist(
                    album.textContent,
                    track_artist
                );

            const album_link = track.querySelector('.chartlist-image a');

            const show_album_text =
                (is_active || settings.expand_tracks == 'always') &&
                settings.expand_tracks != 'never' &&
                settings.track_layout == 'column';
            track.setAttribute('data-show-album-text', show_album_text);

            const image_wrap = track.querySelector('.chartlist-image');
            let link;
            let image;
            if (image_wrap) {
                link = image_wrap.querySelector('.cover-art');
                image = link.querySelector('img');

                if (!is_album && has_bar) {
                    hoshino(
                        image,
                        track_title.getAttribute('data-name'),
                        track_artist,
                        link
                    );
                }
            }

            let song_artist_element = track.querySelector('.chartlist-artist');
            if (song_artist_element) {
                track.appendChild(song_artist_element);
            }

            if (settings.corrections) {
                let song_artist_element = track.querySelector(
                    '.chartlist-artist a'
                );
                if (song_artist_element) {
                    let corrected_title = romanise(
                        correct_item_by_artist(
                            track_title.textContent,
                            song_artist_element.textContent
                        )
                    );
                    track_title.textContent = corrected_title;
                    track_title.setAttribute('data-name', corrected_title);

                    let corrected_artist = romanise(
                        correct_artist(song_artist_element.textContent)
                    );
                    song_artist_element.textContent = corrected_artist;
                    song_artist_element.setAttribute('title', corrected_artist);
                } else {
                    let corrected_title = correct_item_by_artist(
                        track_title.textContent,
                        track_artist
                    );
                    track_title.textContent = corrected_title;
                    track_title.setAttribute('data-name', corrected_title);
                }
            }
        }
    });
}
