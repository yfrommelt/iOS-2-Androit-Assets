var morph = require('morph')
var mkdirp = require('mkdirp');
var path = require('path');
var fs = require('fs');
var im = require('imagemagick');

window.ondragover = window.ondrop = function(e) {
	e.preventDefault();
	return false;
};

var dropZone = document.querySelector('#drop');

dropZone.ondragover = function(e) {
	this.className = 'hover';
	this.innerHTML = 'Drop the files';
	return false;
};

dropZone.ondragleave = function(e) {
	this.className = '';
	this.innerHTML = 'Drop your iOS assets here';
	return false;
};

var density = {
	'mdpi': 1,
	'hdpi': 1.5,
	'xhdpi': 2,
	'xxhdpi': 3,
	'xxxhdpi': 4,
};


var matching = {
	'@2x': 'xhdpi',
	'@3x': 'xxhdpi',
	'@4x': 'xxxhdpi', //prevision 2014-11-06
}

var reg = /@(\d)x/i;

dropZone.ondrop = function(e) {
	e.preventDefault();

	var files = Object.keys(e.dataTransfer.files).map(function(k) { return e.dataTransfer.files[k] });
	var files_complete = new Array();

	var source_dirname = path.dirname(files[0].path);
	for (var resolution in density) {
		mkdirp(source_dirname + path.sep + 'drawable-' + resolution, function(err) {});
	}
	
	files.sort(function(a, b) {
		if (typeof a != 'object' || typeof b != 'object') {
			return;
		}
		return (a.name.match(reg)[1] < b.name.match(reg)[1]);
	});

	for (var i = 0; i < files.length; i++) {
		var converted = 0;
		var source_file = files[i].path;
		var source_extension = path.extname(source_file);
		var source_basename = path.basename(source_file, source_extension);
		var target_basename = morph.toSnake(source_basename.replace(reg, ''));

		var maches = source_basename.match(reg);
		if (maches && maches.length > 0) {
			console.log(maches[0]);
			var ratio = (1/density[matching[maches[0]]]);
			for (var resolution in density) {

				var resize = ((density[resolution]*ratio)*100);

				var target_dirname = source_dirname + path.sep + 'drawable-' + resolution;
				var target_file = target_dirname + path.sep + target_basename + source_extension;


				// console.log(target_file);
				// console.log(files_complete.indexOf(target_file), resize, 100 > resize);
				
				if (-1 === files_complete.indexOf(target_file)
					|| (-1 !== files_complete.indexOf(target_file) && 100 > resize)) {

					im.convert([source_file, '-resize', resize+'%', target_file], function(err, stdout) {
						if (err) throw err;
					});

				}

				files_complete.push(target_file);

			}
		}

		this.className = '';
		dropZone.innerHTML = 'Resize finished !';
	}
};
