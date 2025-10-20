//
// bwaa, an extension for the music site Last.fm
// Copyright (c) 2025 katelyn and contributors
// Licensed under GPLv3
//

import {log} from "./build/log";
import {bwaa} from "./page";

import version2 from "./build/build.json" with {type: "json"}

export const version = version2;
export const theme_version = {
    state: ""
}

log(`starting ${version.build}.${version.sku}`, 'load');
bwaa();
