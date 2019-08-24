'use strict';

require("./styles.scss");

import * as map from "./assets/@em-polymer/google-map/google-map";

const {
    Elm
} = require('./Main');
var app = Elm.Main.init({
    flags: process.env.GKEY
});