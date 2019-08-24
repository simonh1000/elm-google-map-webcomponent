'use strict';

require("./styles.scss");

//npm i @em-polymer/google-map
import * as map from "./assets/@em-polymer/google-map/google-map";
//import * as marker from "@em-polymer/google-map/google-map-marker";

const {Elm} = require('./Main');
var app = Elm.Main.init({flags: process.env.GKEY});

