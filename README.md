# Micronets MUD Registry

This is a simple dockerized node.js instance used to register client (STA) devices and lookup MUD urls for those devices. Currently, registration is minimal - associating a device model identifier and vendor code with a public key. This device model identifier is also used as the name of the MUD file when returning MUD urls. MUD files can also be looked up using the device model (if known) instead of the public key. These endpoints use the `/model` prefix.

Vendor codes are currently 4 capitalized charactors, allowing for approximately 500,000 STA device manufacturers. It is kept small to minimize the space required in a QR Code that is scanned in the course of DPP onboarding.

The static set of vendor codes & mud registry urls used on the CableLabs MUD Registry are:

- SHCR : https://shurecare.micronets.in/registry/devices
- VTLF : https://vitalife.micronets.in/registry/devices
- ACMD : https://acmemeds.micronets.in/registry/devices
- DAWG : https://hotdawg.micronets.in/registry/devices

These can be redefined in a configuration file which will be read by the server instance. The configuration file is described in the **Installation** section below.

The CableLabs provided global mud registry is located here:

- https://registry.micronets.in/mud

You can deploy your own standalone instance of the MUD Registry. You will need to configure the following modules in your system to point to this instance:

- Client Device
- Mobile device
- Micronets Manager

See the corresponding **Installation** guides for these modules for more information.

## Operation
The MUD registry uses an HTTP API for all operations:

### API
The following examples demonstrate how to use the HTTP API:
```
# Retrieve the device registry URL for a vendor:
# /device-registry/:vendor-code

$ curl https://registry.micronets.in/mud/v1/device-registry/SHCR
   > https://shurecare.micronets.in/registry/devices/register-device

# Register a device with a vendor's registry
# /register-device/:device-model-UID64/:public-key

$ curl -X POST https://shurecare.micronets.in/registry/v1/devices/register-device/CQQPBgMCCwk/MYDEVICEPUBLICKEY
   > Device registered.

# Retrieve the MUD registry URL for a vendor:
# /mud-registry/:vendor-code

$ curl https://registry.micronets.in/mud/v1/mud-registry/SHCR
   > https://shurecare.micronets.in/registry/devices/mud-registry

# Lookup a MUD url from the vendor MUD registry:
# /mud-registry/:public-key

$ curl https://shurecare.micronets.in/registry/devices/mud-registry/MYDEVICEPUBLICKEY
   > https://shurecare.micronets.in/registry/devices/mud-registry

## Convenience endpoints that redirect to the vendor ##

# Register a device through the global registry:
# /register-device/:vendor-code/:device-model-UID64/:public-key

$ curl -L -X POST https://registry.micronets.in/mud/v1/register-device/ACMD/BQ0LDQsMDAM/NUTHERPUBLICKEY
   > Device registered.

# Lookup a MUD url from the global registry
# /mud-url/:vendor-code/:public-key

$ curl -L https://registry.micronets.in/mud/v1/mud-url/ACMD/NUTHERPUBLICKEY
   > https://alpineseniorcare.com/micronets-mud/BQ0LDQsMDAM

# retrieve a MUD file via the global registry
# /mud-file/:vendor-code/:public-key

$ curl -L https://registry.micronets.in/mud/v1/mud-file/ACMD/NUTHERPUBLICKEY
   > (contents of MUD file)


################################################################################
# Lookup a device MUD using only the vendor code and the device model
# (using device model instead of public key. Note 'model' prefix on path)

# Lookup a MUD url from the global registry
# /model/mud-url/:vendor-code/:device-model

$ curl -L https://registry.micronets.in/mud/v1/model/mud-url/ACMD/BQ0LDQsMDAM
   > https://alpineseniorcare.com/micronets-mud/BQ0LDQsMDAM

# retrieve a MUD file via the global registry
# /model/mud-file/:vendor-code/:device-model

$ curl -L https://registry.micronets.in/mud/v1/model/mud-file/ACMD/BQ0LDQsMDAM
   > (contents of MUD file)


```

Note: The above examples assume that the MUD files for the specified device models already exist at the specified MUD urls.

Note: The above examples are using 11 digit UID64 device model identifiers. Any unique indentifer scheme can be used.

## Installation
There are two types of installation:
- Install an existing docker container (recommended)
  + [Download & Run a Tagged Docker Image](https://github.com/cablelabs/micronets/wiki/Docker-Deployment-Guide#docker-image-installation), using a known tag (e.g. 'nccoe-build-3').
  + Continue with the **Configuration** section (below)
- Build and install a docker container from sources (instructions follow)

#### Build
Edit `package.json` to be sure the docker remote registry URL is correct for the `docker_publish` script

```  
"scripts": {
    "start": "node ./mud-registry",
    "docker-build": "docker build -t community.cablelabs.com:4567/micronets-docker/micronets-mud-registry .",
    "docker-publish": "docker login community.cablelabs.com:4567; docker push community.cablelabs.com:4567/micronets-docker/micronets-mud-registry"
},
```
Install packages, build and publish:
```
  npm install
  npm run docker_build
  npm run docker_publish
```
#### Deployment
The Micronets MUD Registry is normally deployed as a docker container.
Docker deployment instructions can be found [here](https://github.com/cablelabs/micronets/wiki/Docker-Deployment-Guide)

### Configuration
You can configure your own vendor codes/endpoints, base URL for serving mud files, and location for the database file. The configuration file **must** be named `mud-registry.conf`, and **must** live in a host folder that is passed to the docker instance. See the **Example Run Command** below.

```
{
    "vendors" : {
        "TEST": "https://mydomain.com/registry/devices",
        "ABCD": "https://abcd-domain.com:3082/vendors"
    },
    "mud_base_uri": "https://mydomain.com/micronets-mud",
    "device_db_file": "/etc/micronets/config/device-registration.nedb"
}
```
Note on vendor endpoints:
The URL specified for a vendor in the example above can be anything you like - as long as it ultimately resolves to the `vendors` route in your server instance. For example, `registry/devices` for vendor `TEST` is routed to `vendors/` in the docker instance running on port 3082. Here is an example **NGINX** virtual host definition to illustrate this:

```
server {

  # SSL configuration
  listen 443 ssl;
  listen [::]:443 ssl;

  root /var/www/mydomain.com/html;
  index index.html index.htm index.nginx-debian.html;
  server_name mydomain.com;

  location / {
    # First attempt to serve request as file, then
    # as directory, then fall back to displaying a 404.
    try_files $uri $uri/ =404;
  }

  location /registry/devices {
    proxy_pass      http://localhost:3082/vendors/;
  }

  ssl_certificate /etc/letsencrypt/live/mydomain.com/fullchain.pem; # managed by Certbot
  ssl_certificate_key /etc/letsencrypt/live/mydomain.com/privkey.pem; # managed by Certbot
}
```

You will notice that vendor `ABCD` routes directly to the `/vendors` route on the docker instance running on port 3082. This is perfectly valid, but requires exposing a TCP port to the outside world.

### Example run command
The configuration folder lives on the host machine and is mapped to the docker instance with the `-v` parameter.
```
docker run -d --name=micronets-mud-registry -v /etc/micronets/config:/etc/micronets/config community.cablelabs.com:4567/micronets-docker/micronets-mud-registry:latest
```
