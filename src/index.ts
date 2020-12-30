import path from "path";
import fs from "fs";

function fileExists(filePath: string) {
	try {
		return fs.statSync(filePath).isFile();
	} catch (err) {
		return false;
	}
}

function search_for_file_upwards(start: string, filename: string) {
	let current_dir = start;
	let file_path = path.resolve(current_dir, filename);
	while (!fileExists(file_path)) {
		if (current_dir == "/") {
			throw new Error(
				"Could not find '" +
					filename +
					"' in any of the parent directories."
			);
		}
		current_dir = path.resolve(current_dir, "../");
		file_path = path.resolve(current_dir, filename);
	}
	return file_path;
}

function locreq_resolve(caller_path: string, module_path: string) {
	const package_path = search_for_file_upwards(caller_path, "package.json");
	return path.resolve(package_path, "../", module_path);
}

function locreq(caller_path: string, module_path: string) {
	return require(locreq_resolve(caller_path, module_path));
}

function curry_locreq(caller_path: string) {
	let curried: {
		(module_path: string): any;
		resolve: (module_path: string) => string;
	} = (() => {
		const f = function (module_path: string) {
			return locreq(caller_path, module_path);
		};
		f.resolve = function (module_path: string) {
			return locreq_resolve(caller_path, module_path);
		};
		return f;
	})();

	return curried;
}

export default curry_locreq;
