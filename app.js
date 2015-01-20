var morph = require('morph')
var mkdirp = require('mkdirp');
var path = require('path');
var lwip = require('lwip');

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

	for(var i = 0, l = files.length; i < l; i++) {
		if (typeof files[i] == "object") {

			var source_file = files[i].path;
			var source_extension = path.extname(source_file);
			var source_basename = path.basename(source_file, source_extension);
			var target_basename = morph.toSnake(source_basename.replace(reg, ''));

			var maches = source_basename.match(reg);
			if (maches && maches.length > 0) {
				var ratio = (1/density[matching[maches[0]]]);
				for (var resolution in density) {

					var resize = (density[resolution] * ratio);

					var target_dirname = source_dirname + path.sep + 'drawable-' + resolution;
					var target_file = target_dirname + path.sep + target_basename + source_extension;

					// console.log(source_file, target_file);
					
					if (-1 === files_complete.indexOf(target_file)
						|| (-1 !== files_complete.indexOf(target_file) && 1 > resize)) {

						resizeFile(source_file, target_file, resize);
					}

					files_complete.push(target_file);

				}
			}
		}
		
		if (i == l-1) {
			this.className = '';
			dropZone.innerHTML = 'Resize finished !';
		}
	}
};


var resizeFile = function(from, to, ratio) {
	lwip.open(from, function(err, image){
		image.batch()
		.scale(ratio)
		.writeFile(to, function(err){
			if (err) console.log(err);
		});
	});

	// im.convert([from, '-resize', (ratio * 100)+'%', to], function(err, stdout) {
	// 	console.log(err);
	// });
	// 
}
