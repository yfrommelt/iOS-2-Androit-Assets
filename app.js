var morph = require('morph')
var mkdirp = require('mkdirp');
var path = require('path');
var fs = require('fs');
var im = require('imagemagick');

window.ondragover = window.ondrop = function(e) {
	e.preventDefault();
	return false;
}

var dropZone = document.querySelector('#drop');

dropZone.ondragover = function(e) {
	this.className = "hover";
	this.innerHTML = "Drop the files";
	return false;
}

dropZone.ondragleave = function(e) {
	this.className = "";
	this.innerHTML = "Drop your iOS assets here";
	return false;
}

var density = {
	'ldip' : 0.25,
	'mdip' : 0.5,
	'hdip' : 0.75,
	'xhdip' : 1
};

dropZone.ondrop = function(e) {
	e.preventDefault();

	var source_dirname = path.dirname(e.dataTransfer.files[0].path);
	for (var resolution in density) {
		mkdirp(source_dirname + path.sep + 'drawable-' + resolution, function(err) {});
	}

	var nb_files = e.dataTransfer.files.length;

	for (var i = 0; i < nb_files; i++) {
		var converted = 0;
		var source_file = e.dataTransfer.files[i].path;
		var source_extension = path.extname(source_file);
		var source_basename = path.basename(source_file, source_extension);
		var target_basename = morph.toSnake(source_basename.replace('@2x', ''));

		if (source_basename.indexOf('@2x') > 0) {
			for (var resolution in density) {
				var target_dirname = source_dirname + path.sep + 'drawable-' + resolution;
				var target_file = target_dirname + path.sep + target_basename + source_extension;

				im.convert([source_file, '-resize', (density[resolution]*100)+'%', target_file], function(err, stdout) {
					if (err) throw err;
					// converted++;
					// if (converted == (Object.keys(density).length * nb_files)) {
					// 	this.className = "";
					// 	dropZone.innerHTML = "Travail terminé";
					// }
				});
			}
		}

		this.className = "";
		dropZone.innerHTML = "Travail terminé";
	}
}

function copyFile (source, target, cb) {
	var cbCalled = false;

	var rd = fs.createReadStream(source);
	rd.on("error", function(err) {
		done(err);
	});
	var wr = fs.createWriteStream(target);
	wr.on("error", function(err) {
		done(err);
	});
	wr.on("close", function(ex) {
		done();
	});
	rd.pipe(wr);

	function done(err) {
		if (!cbCalled) {
			cb(err);
			cbCalled = true;
		}
	}
}