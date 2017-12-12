"use strict";

var browserSync = require("browser-sync").create();

browserSync.init({
	server: {
		baseDir: './src',
		index: 'index.html',
		routes: {
			"/node_modules" : "./node_modules"
		}
	},
	watchOptions: {
		ignoreInitial: true,
		ignored: '*.mp3'
	}
});