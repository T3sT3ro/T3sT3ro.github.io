use serde_json::{Result as JsonRes, Value as JsonVal};
use std::{fs::File, io::Read};
use toml::Value as TomlVal;
use zip::{read::ZipFile, ZipArchive};
use regex::Regex;

fn main() {
    let jar_path = std::env::args().nth(1).expect("pass *.jar file path");
    let t = get_version(jar_path);
    println!("{}", t);
}

fn get_version(jar_path: String) -> String {
    let jar_file = File::open(jar_path).expect("File not found");
    let mut jar_archive = ZipArchive::new(jar_file).expect("Can't open .jar file");

    match jar_archive
        .by_name("fabric.mod.json")
        .map(get_version_string_from_json)
    {
        Ok(ver) => return ver,
        Err(e) => e,
    };

    match jar_archive
        .by_name("quilt.mod.json")
        .map(get_version_string_from_json)
    {
        Ok(ver) => return ver,
        Err(e) => e,
    };

    match jar_archive
        .by_name("META-INF/mods.toml")
        .map(get_version_string_from_toml)
    {
        Ok(ver) => {
            return if ver != "${file.jarVersion}" {
                ver
            } else {
                jar_archive
                    .by_name("META-INF/MANIFEST.MF")
                    .map(get_version_string_from_manifest)
                    .expect("cannot determine version")
            }
        }
        Err(_) => panic!("cannot determine version"),
    };
}

fn read_zip_file_content(mut zip_file: ZipFile<'_>) -> String {
    let mut content = String::new();
    let _n = zip_file
        .read_to_string(&mut content)
        .expect("couldn't read file");
    return content;
}

fn get_version_string_from_json(zip_file: ZipFile<'_>) -> String {
    let content = read_zip_file_content(zip_file);
    let config: JsonRes<JsonVal> = serde_json::from_str(content.as_str());

    return String::from(
        config.expect("couldn't read json")["version"]
            .as_str()
            .expect("missing version string in json"),
    );
}

fn get_version_string_from_toml(zip_file: ZipFile<'_>) -> String {
    let content = read_zip_file_content(zip_file);
    let config: TomlVal = toml::from_str(content.as_str()).expect("can't read toml");
    // println!("{:?}", config["mods"][0]["version"].as_str());
    return String::from(config["mods"][0]["version"].as_str().expect("missing version string in toml"));
}

fn get_version_string_from_manifest(zip_file: ZipFile<'_>) -> String {
    let content = read_zip_file_content(zip_file);
    let re  = Regex::new(r"Implementation-Version: (?P<version>.*)").unwrap();
    let caps = re.captures(content.as_str());
    return String::from(&caps.unwrap()["version"]);
}
