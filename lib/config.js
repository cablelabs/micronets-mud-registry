/* Configuration
 *
 * This module provides a default configuration. If a local or external configuration file is available, 
 * then that data is used.
 *
 * First, ./mud-registry.conf is checked
 * Second, /etc/micronets/mud-registry.conf is checked for a config file (mapped when running as docker container)
 * If neither file is available, the static data below is used.
 */

const fs = require('fs');

let config = {
	"vendors" : {
		"SHCR": "https://shurecare.micronets.in/registry/devices",
		"VTLF": "https://vitalife.micronets.in/registry/devices",
		"ACMD": "https://acmemeds.micronets.in/registry/devices",
		"DAWG": "https://hotdawg.micronets.in/registry/devices"
	},
	"mud_base_uri": "https://alpineseniorcare.com/micronets-mud",
	"device_db_file": "/etc/micronets/config/device-registration.nedb"
}

loadConfiguration('/etc/micronets/config/mud-registry.conf')
loadConfiguration('./mud-registry.conf')

function loadConfiguration(filename) {

	if (fs.existsSync(filename)) {
		try {

			filedata = fs.readFileSync(filename, "utf8");
			configuration = JSON.parse(filedata);
			if (configuration.vendors) {
				config.vendors = configuration.vendors;
			}
			if (configuration.mud_base_uri) {
				config.mud_base_uri = configuration.mud_base_uri;
			}
			if (configuration.device_db_file) {
				config.device_db_file = configuration.device_db_file;
			}

		} catch(e) {
			console.log(filename + " - file load/parse error: "+e);
		}
	}
}

console.log("configuration loaded: \n"+JSON.stringify(config, null, 4)+"\n\n");

module.exports = config;
