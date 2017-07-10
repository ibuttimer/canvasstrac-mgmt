# canvasstrac-mgmt
Web management application for CanvassTrac suite.

## Development Environment
The development environment:
* Nodejs v6.10.1
* npm v2.15.9
* bower v1.7.9
* gulp v3.9.1
* MongoDB v3.2.4

### Environment setup
In an appropriate folder:
* git clone https://github.com/ibuttimer/canvasstrac-mgmt.git
* cd canvasstrac-mgmt
* git submodule init
* git submodule update
* npm install
* bower install

### Development
See <code>gulp --help</code> for development workflow options.

See [configuration file readme](config/readme.txt) for details of creating a configuration file.

For example, to start a local server using a configuation file called localdev.json, use the following:
  <code>gulp watch --env localdev</code>

### Make a build
From the project folder run the following commands:
* for a development build
<code>gulp --env 'config file name'</code>
* for a production build
<code>gulp --production --env 'config file name'</code>


