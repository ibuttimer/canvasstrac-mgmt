# canvasstrac-mgmt
Web management application for CanvassTrac suite.

## Development Environment
The development environment:
* Node.js v12.18.4
* npm v6.14.6
* gulp CLI version: 2.3.0
* gulp Local version: 4.0.2
* MongoDB v4.2.9

### Environment setup
In an appropriate folder:
* git clone https://github.com/ibuttimer/canvasstrac-mgmt.git
* cd canvasstrac-mgmt
* git submodule init
* git submodule update
* npm install


### Development
See <code>gulp --help</code> for development workflow options.

See [configuration file readme](config/readme.txt) for details of creating a configuration file.

For example, to start a local server using a configuation file called <code>localdev.json</code> in a directory called <code>config</code> above the project root directory, use the following:
  <code>gulp watch --env localdev --cfgdir ../config</code>

### Make a build
From the project folder run the following commands:
* for a development build
<code>gulp --env 'config file name' --cfgdir 'config dir'</code>
* for a production build
<code>gulp --production --env 'config file name' --cfgdir 'config dir'</code>


