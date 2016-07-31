const path = require("path");
const fs = require("fs");

function fileExists(filePath) {
    try {
        return fs.statSync(filePath).isFile();
    } catch (err) {
        return false;
    }
}

function search_for_file_upwards(start, filename){
	let current_path = path.resolve(start, "./" + filename)
	while(!fileExists(current_path)){
		current_path = path.resolve(current_path, "../../" + filename);
	}
	return current_path;
}

function locreq(caller_path, module_path){
	const package_path = search_for_file_upwards(caller_path, "package.json");
	const to_require = path.resolve(package_path, "../", module_path);
	return require(to_require);
}

module.exports = locreq;
