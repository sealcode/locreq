import path from "path";
import fs from "fs";
import fsPromises from "fs/promises";

async function file_exists(filePath: string) {
	try {
		return (await fsPromises.stat(filePath)).isFile();
	} catch (err) {
		return false;
	}
}

function file_exists_sync(filePath: string) {
	try {
		return fs.statSync(filePath).isFile();
	} catch (err) {
		return false;
	}
}

async function search_for_file_upwards(start: string, filename: string) {
	let current_dir = start;
	let file_path = path.resolve(current_dir, filename);
	while (!(await file_exists(file_path))) {
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

function search_for_file_upwards_sync(start: string, filename: string) {
	let current_dir = start;
	let file_path = path.resolve(current_dir, filename);
	while (!file_exists_sync(file_path)) {
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

async function locreq_resolve(caller_path: string, module_path: string) {
	const package_path = await search_for_file_upwards(
		caller_path,
		"package.json"
	);
	return path.resolve(package_path, "../", module_path);
}

function locreq_resolve_sync(caller_path: string, module_path: string) {
	const package_path = search_for_file_upwards_sync(
		caller_path,
		"package.json"
	);
	return path.resolve(package_path, "../", module_path);
}

async function locreq(
	caller_path: string,
	module_path: string
): Promise<unknown> {
	return require(await locreq_resolve(caller_path, module_path));
}

function locreq_sync(caller_path: string, module_path: string): unknown {
	return require(locreq_resolve_sync(caller_path, module_path));
}

function curry_locreq(caller_path: string) {
	let curried: {
		(module_path: string): Promise<unknown>;
		resolve: (module_path: string) => Promise<string>;
	} = (() => {
		const f = async function (module_path: string) {
			return await locreq(caller_path, module_path);
		};
		f.resolve = async function (module_path: string) {
			return await locreq_resolve(caller_path, module_path);
		};
		return f;
	})();

	return curried;
}

function curry_locreq_sync(caller_path: string) {
	let curried: {
		(module_path: string): unknown;
		resolve: (module_path: string) => string;
	} = (() => {
		const f = function (module_path: string) {
			return locreq_sync(caller_path, module_path);
		};
		f.resolve = function (module_path: string) {
			return locreq_resolve_sync(caller_path, module_path);
		};
		return f;
	})();

	return curried;
}

//curry_locreq -> Asynchronous
//curry_locreq_sync -> Synchronous
export default curry_locreq;