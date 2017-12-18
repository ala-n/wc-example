"use strict";

var browserSync = require("browser-sync").create();

browserSync.init({
	files: ["./src/**/*"],
	server: {
		baseDir: './src',
		index: 'index.html',
		routes: {
			"/node_modules" : "./node_modules"
		}
	}
});