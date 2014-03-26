var morph = require('morph')
var mkdirp = require('mkdirp');
var path = require('path');
var fs = require('fs');

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

var mdip = 'drawable-mdip';
var xhdip = 'drawable-xhdip';


dropZone.ondrop = function(e) {
	e.preventDefault();

	for (var i = 0; i < e.dataTransfer.files.length; i++) {
		var source_file = e.dataTransfer.files[i].path;
		var source_extension = path.extname(source_file);
		var source_basename = path.basename(source_file, source_extension);
		var source_dirname = path.dirname(source_file);
		var target_basename = morph.toSnake(source_basename.replace('@2x', ''));

		var target_res_dirname = (source_basename.indexOf('@2x') > 0) ? xhdip : mdip;
		var target_dirname = source_dirname + path.sep + target_res_dirname;

		mkdirp(target_dirname, function(err) {});


		var target_file = target_dirname + path.sep + target_basename + source_extension;
		copyFile(source_file, target_file, function(err) {});

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