//
// bwaa, an extension for the music site Last.fm
// Copyright (c) 2025 katelyn and contributors
// Licensed under GPLv3
//

import { settings } from '../build/config';
import { page, root } from '../build/page';
import {
    clamp_lit,
    clamp_sat,
    copy,
    int_from_string,
    rgb_to_hsl,
    romanise
} from '../build/tools';
import { lang, tl, trans } from '../build/trans';
import { parse_scrobbles_as_rank } from './colourful_counts';
import { correct_artist, correct_item_by_artist, name_includes } from './lotus';
import { html, render } from 'lighterhtml';
import ColorThief from 'color-thief-browser';
import { register_menu } from './menu';
import tippy from 'tippy.js';
import { expand_avatar } from '../avatar';
import { save_hoshino_artwork } from './hoshino';

export function music_grids(search = page.structure.main, use_colour = true) {
    if (!search) return;

    let grids = search.querySelectorAll(
        '.grid-items-item:not([data-bwaa-music-grids])'
    );
    grids.forEach((grid, index) => {
        let is_loading = grid.querySelector('.grid-items-empty-inner') != null;
        if (is_loading) return;

        grid.style.setProperty('--delay', index * 0.04 + 's');

        grid.setAttribute('data-bwaa-music-grids', 'true');

        let is_album;
        if (page.type == 'search') {
            // search, tag pages
            is_album = grid.querySelector('.stat-name') == null;
        } else {
            // profiles
            is_album = grid.querySelector('.grid-items-item-aux-block') != null;
        }

        let image_wrap = grid.querySelector('.grid-items-cover-image-image');
        let image = image_wrap.querySelector('img');

        if (grid.classList.contains('grid-items-item--big'))
            image.src = image.src.replace('/avatar300s/', '/500x500/');

        if (
            image &&
            !image_wrap.classList.contains('grid-items-cover-default') &&
            use_colour
        ) {
            let grid_colour = document.createElement('div');
            grid_colour.classList.add('grid-item-colour-bg');
            image_wrap.appendChild(grid_colour);

            image.setAttribute('crossorigin', 'anonymous');
            try {
                image.addEventListener('load', function () {
                    let thief = new ColorThief();
                    let colour = thief.getColor(image);

                    let hsl = rgb_to_hsl(colour[0], colour[1], colour[2]);

                    grid_colour.style.setProperty(
                        'background',
                        `rgb(${colour})`
                    );

                    let hue = hsl.h;
                    let sat = clamp_sat((hsl.s / 100) * 3);
                    let lit = clamp_lit(sat, hsl.l / 100 + 0.35);

                    grid.classList.add('grid-items-item-has-colour');
                    grid.style.setProperty('--hue-over', hue);
                    grid.style.setProperty('--sat-over', sat);
                    grid.style.setProperty('--lit-over', lit);
                });
            } catch (e) {}

            // TODO: add a timeout to check if the image has had its
            // colour taken and if not do it manually after a set amount of time
        } else {
            grid.classList.add('generic-cover');
        }

        let plays_elem;
        if (page.type == 'search') {
            if (!is_album) {
                let aux_text = grid.querySelector('.grid-items-item-aux-text');
                let stat_name = aux_text.querySelector('.stat-name');

                aux_text.removeChild(stat_name);

                plays_elem = aux_text;
            }
        } else if (page.type == 'tag') {
            let aux_text = grid.querySelector('.grid-items-item-aux-text');
            let stat_name = aux_text.querySelector('.stat-name');
            if (!stat_name) return;

            aux_text.removeChild(stat_name);

            plays_elem = aux_text;

            if (is_album) {
                let artist = grid.querySelector('.grid-items-item-aux-block');

                aux_text.removeChild(artist);

                plays_elem = document.createElement('a');
                plays_elem.textContent = aux_text.textContent;

                aux_text.textContent = '';

                aux_text.appendChild(artist);
                aux_text.appendChild(plays_elem);
            }
        } else {
            plays_elem = grid.querySelector(
                '.grid-items-item-aux-text a:last-child'
            );
        }

        let name = grid.querySelector('.grid-items-item-main-text a');
        if (!name) return;

        let artist;

        if (!is_album) {
            name.textContent = romanise(
                correct_artist(name.textContent.trim())
            );
        } else {
            artist = grid.querySelector('.grid-items-item-aux-block');
            if (!artist)
                artist = grid.querySelector('.grid-items-item-aux-text');
            if (!artist) return;

            save_hoshino_artwork(
                image.src.replace('/500x500/', '/avatar300s/'),
                name.textContent.trim(),
                artist.textContent.trim()
            );

            artist.textContent = romanise(
                correct_artist(artist.textContent.trim())
            );

            name.textContent = romanise(
                correct_item_by_artist(
                    name.textContent.trim(),
                    artist.textContent.trim()
                )
            );
        }
    });
}
