const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

module.exports = (from, to, {fromhost, tohost, username, password}={}) => {
  fromhost = fromhost ? '--host=' + fromhost : '';
  tohost = tohost ? '--host=' + tohost : '';
  if (username && !password) {
    throw new Error("Username requires a password");
  }
  if (!username && password) {
    throw new Error("Password requires a username");
  }
  username = username ? '--username=' + username : '';
  password = password ? '--password=' + password : '';
  let cmd = `mongodump --archive ${fromhost} ${username} ${password} --db=${from} --quiet | mongorestore --archive ${tohost} --nsFrom='${from}.*' --nsTo='${to}.*' --quiet`
  return exec(cmd);
}
