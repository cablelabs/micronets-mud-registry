# Micronets MUD Registry (micronets-mud-registry)

A simple dockerized node.js instance used to register client (STA) devices and lookup MUD urls for those devices. Currently, registration is minimal - associating a UID64 device model identifier and vendor code with a public key.

Vendor codes are currently 4 capitalized charactors, allowing for approximately 500,000 STA device manufacturers. It is kept small to minimize the space required in a QR Code that is scanned in the course of DPP onboarding.

The current set of vendor codes & mud registry urls are:

- SHCR : https://shurecare.micronets.in/registry/devices
- VTLF : https://vitalife.micronets.in/registry/devices
- ACMD : https://acmemeds.micronets.in/registry/devices

The current global mud registry is:

- https://registry.micronets.in/mud

## API

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

```

Note: The above examples assume that the MUD files for the specified device models (UID64) already exist at the specified MUD urls.

Note: The above examples are using 11 digit UID64 device model identifiers. Any unique indentifer scheme can be used.


## Build
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
## Deploy
The Micronets MUD Registry is deployed as a docker container.
Docker deployment instructions can be found [here](https://github.com/cablelabs/micronets/wiki/Docker-Deployment-Guide)

## Example run command
```
docker run -d --name=micronets-mud-registry community.cablelabs.com:4567/micronets-docker/micronets-mud-registry:latest
```
