"use strict";

const path = require("path");
const fs = require("fs");

function fileExists(filePath) {
    try {
        return fs.statSync(filePath).isFile();
    } catch (err) {
        return false;
    }
};

function search_for_file_upwards(start, filename){
	let current_dir = start;
	let file_path = path.resolve(current_dir, filename);
	while(!fileExists(file_path)){
		if(current_dir == "/"){
			throw new Error("Could not find '" + filename + "' in any of the parent directories.");
		}
		current_dir = path.resolve(current_dir, "../");
		file_path = path.resolve(current_dir, filename);
	}
	return file_path;
};

function locreq_resolve(caller_path, module_path){
	const package_path = search_for_file_upwards(caller_path, "package.json");
	return path.resolve(package_path, "../", module_path);
}

function locreq(caller_path, module_path){
	return require(locreq_resolve(caller_path, module_path));
};

function curry_locreq(caller_path){
	let curried = function(module_path){
		return locreq(caller_path, module_path);
	};
	
	curried.resolve = function(module_path){
		return locreq_resolve(caller_path, module_path);
	}

	return curried;
};

module.exports = curry_locreq;
