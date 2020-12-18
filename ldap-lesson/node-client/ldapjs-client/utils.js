/*
 * Programming Hyperledger Fabric
 * Siddharth Jain
 * (c) All rights reserved.
 */

var fs = require("fs");
const yaml = require('js-yaml');
// global config
var config;
var Client = require("./client.js");
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;
const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
})
const logger = getLogger('Utils', 'debug');

function getLogger(name, logLevel) {
    const thisLogger = createLogger({
        level: logLevel,
        format: combine(
            format.colorize(),
            label({ label: name }),
            timestamp(),
            myFormat
        ),
        transports: [
            new (transports.Console)({colorize: true, timestamp: true})
        ],
        rejectionHandlers: [
            new (transports.Console)({colorize: true, timestamp: true})
        ]
    });	
    // https://github.com/winstonjs/winston/issues/1498#issuecomment-433680788
    thisLogger.error = err => {
        if (err instanceof Error) {
            thisLogger.log({ level: 'error', message: `${err.stack || err}` });
        } else {
            thisLogger.log({ level: 'error', message: err });
        }
    };
    return thisLogger;
};

function getEnv(name) {
    var v = tryGetEnv(name);
    if (!v) {
        console.error(name + " is not defined");
        process.exit(1);
    }
    return v;
}

function tryGetEnv(name, defaultValue) {
    var x = process.env[name];
    if (!x) {
        x = defaultValue;
    }
    return x;
}

function loadConfig(file) {    
    config = yaml.safeLoad(fs.readFileSync(file, 'utf8'));
}

/**
 * This will get the config from the config file or env variable. 
 * Env variables override values in the config file. You should call loadConfig
 * before you call this method otherwise it will look only at the env variables
 * for config values.
 * @param {} key - The key is CASE SENSITIVE when it comes to the config file
 * @param {*} throw_if_null 
 */
function getConfig(key, throw_if_null) {
    const settingKeys = key.split('.');
    const processEnvName = getEnvKey(settingKeys);
    let value;
    if (process.env[processEnvName]) {
        value = process.env[processEnvName];
    } else {
        value = config[settingKeys[0]];
        for (let i=1; i<=settingKeys.length-1; i++) {
            if (value) {
                value = value[settingKeys[i]];
            }
        }
    }
    logger.info(`${key} = ${value}`);
    throw_if_null && throwIfNull(value, key);
    return value;
}

function getEnvKey(settingKeys) {
    let processEnvName = '';
    for (let i=0; i<settingKeys.length; i++) {
        if (i == 0) {
            processEnvName += settingKeys[i].toUpperCase();
        } else {
            processEnvName += '_'+settingKeys[i].toUpperCase();
        }
    }
    return processEnvName;
}

function throwIfNull(variable, name) {
    name = name || '';
    // do not throw if variable is boolean and set to false
    if (variable === undefined || variable === null || variable === "") {
        throw new Exception(`${name} is not set`);
    }
}

/**
 * creates connection options from (optional) config file 
 * plus environment variables.
 * @param {creates connection } configFile 
 */
function createConnectionOpts(configFile) {
    if (configFile) {
        loadConfig(configFile);
    }
    var baseDN = getConfig("ldap.base.dn", true);
    var server = getConfig("ldap.server") || 'localhost';
    var port = getConfig("ldap.port") || '389';
    var caCertFile = getConfig("ldap.tls.ca");
    var clientCertFile = getConfig("ldap.tls.cert");
    var clientKeyFile = getConfig("ldap.tls.key");
    var subjectAltName = getConfig("ldap.tls.subjectAltName");
    var baseUrl = "ldap://" + server + ":" + port + "/";
    var url = baseUrl + baseDN;
    var configUrl = baseUrl + "cn=config";
    var adminDN = "cn=admin," + baseDN;
    var configDN = "cn=config";
    var adminPassword = getConfig("ldap.admin.password");
    var configPassword = getConfig("ldap.config.password");
    var tlsCa, tlsCert, tlsKey, tlsOpts;        
    if (caCertFile) {
        if (clientKeyFile) {
            // this means client auth is on
            tlsKey = fs.readFileSync(clientKeyFile);
        }
        if (clientCertFile) {
            // this means client auth is on
            tlsCert = fs.readFileSync(clientCertFile);
        }
        // this means TLS is on
        tlsCa = fs.readFileSync(caCertFile);
        tlsOpts = {
            ca: [tlsCa],
            // Necessary only if the server requires client certificate authentication.
            key: tlsKey,
            cert: tlsCert,  
            host: server,
            servername: subjectAltName, // the subjectAltName in cert returned by server must match this string
            ecdhCurve: 'auto', // see https://github.com/nodejs/node/issues/16196 and https://github.com/joyent/node-ldapjs/issues/464
        };
    }    
    
    return {
        url: url,
        tlsOptions: tlsOpts,
        baseDN: baseDN,
        adminDN: adminDN,
        adminPassword: adminPassword,
        configUrl: configUrl,
        configDN: configDN,
        configPassword: configPassword,
        tlsOptions: tlsOpts
    }
}

async function createClient(opts) {
    if (!opts) {
        opts = createConnectionOpts();
    }
    var client = new Client({url: opts.url});
    if (opts.tlsOptions) {
        await client.starttls(opts.tlsOptions, client.controls);
        return client;
    } else {
        return new Promise((resolve) => {
            setTimeout(() => {
              resolve(client);
            });
          });        
    }    
}

module.exports = {
    createConnectionOpts: createConnectionOpts,
    createClient: createClient
}