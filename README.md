# Postgresql embedded for Node

Postgresql embedded for Node is a
module to download, install and use a
Postgresql server inside a Node
project.

Useful for running integration tests
or develop the project without the
issues of installing a database or
connecting to one in the network.

The first time it runs, it will
deploy a Postgresql Server on a directory.

Each time a server is started, a new
database is created. All the content of the
previous database is lost.

## Installation

```commandline
npm install 
```

## Usage
```Typescript
const pge = new PostgresEmbeddedServer()
// ...
pge.start()
// ...
console.log(pge.isRunning())  // true
// ...
pge.stop()
```

After that, a Postgresql server instance
will be running at:

* host: localhost
* port: 15432
* user: postgres
* password: postgres
* database: postgres

Each time a new instance is launched,
the database is recreated in a `$TMP`
subdirectory.

Connect to it as usual

## Known issues

* It is possible that the Postgresql server will not shut down automatically if the parent NodeJS process is killed.
* Windows support is not complete.
* The port is fixed at 15432
* The user and password are not adjustable.
* Written and tested in Typescript only.


## License

Apache license 2.0