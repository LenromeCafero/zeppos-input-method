
function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf))
}

function str2ab(str) {
  var buf = new ArrayBuffer(str.length * 2) // 2 bytes for each char
  var bufView = new Uint16Array(buf)
  for (var i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i)
  }
  return buf
}

/**
 * Get metadata of a file.
 * @param {} filename
 * @returns
 */
export function statSync(filename) {
  //console.log('statSync', filename)
  const [fs_stat, err] = hmFS.stat(filename)
  //console.log('res', fs_stat, err)
  if (err == 0) {
    //console.log('fs--->size:', fs_stat.size)
    return fs_stat
  } else {
    //console.log('fs--->err:', err)
    return null
  }
}

/**
 * Write data to a file in a single operation. If a file with that name already exists, it is overwritten; otherwise, a new file is created.
 * @param {*} filename
 * @param {*} data
 * @param {*} options
 */
export function writeFileSync(filename, data, options) {
  //console.log('writeFileSync begin -->', filename)

  const stringBuffer = str2ab(data)
  const source_buf = new Uint8Array(stringBuffer)

  const file = hmFS.open(filename, hmFS.O_CREAT | hmFS.O_RDWR | hmFS.O_TRUNC)
  //console.log('writeFileSync file open success -->', file)
  hmFS.seek(file, 0, hmFS.SEEK_SET)
  hmFS.write(file, source_buf.buffer, 0, source_buf.length)
  hmFS.close(file)
  //console.log('writeFileSync success -->', filename)
}

/**
 * Read an entire file into a buffer in a single operation.
 * @param {*} filename
 * @param {*} options
 * @returns
 */
export function readFileSync(filename, options) {
  //console.log('readFileSync fiename:', filename)

  const fs_stat = statSync(filename)
  if (!fs_stat) return undefined

  const destination_buf = new Uint8Array(fs_stat.size)
  const file = hmFS.open(filename, hmFS.O_RDONLY)

  hmFS.seek(file, 0, hmFS.SEEK_SET)
  hmFS.read(file, destination_buf.buffer, 0, fs_stat.size)
  hmFS.close(file)

  const content = ab2str(destination_buf.buffer)
  //console.log('readFileSync', content)
  return content
}

/**
 * Delete a file.
 * @param {*} filename
 */
export function unlinkSync(filename) {
  console.log('unlinkSync begin -->', filename)
  const result = hmFS.remove(filename)
  console.log('unlinkSync result -->', result)
  return result
}

/**
 * Rename a file.
 * @param {*} filename
 */
export function renameSync(oldFilename, newFilename) {
  //console.log('renameSync begin -->', filename)
  hmFS.rename(oldFilename, newFilename)
  //console.log('renameSync success -->', filename)
}

/**
 * Synchronously creates a directory.
 * @param {*} path
 * @param {*} options
 */
export function mkdirSync(path, options) {
  //console.log('mkdirSync begin -->', path)
  hmFS.mkdir(path)
  //console.log('mkdirSync success -->', path)
}

/**
 * Reads the contents of the directory.
 * @param {*} path
 * @param {*} options
 */
export function readdirSync(path, options) {
  //console.log('readdirSync begin -->', path)
  hmFS.readdirSync(path)
  //console.log('readdirSync success -->', path)
}

/**
 * Just to test the fs module
 */
export function test(fileName, dataString) {
  //console.log('saveData begin')

  writeFileSync(fileName, dataString)

  //console.log('fs_writeFileSync -> ', dataString)

  const content = readFileSync(fileName)

  //console.log('fs_readFileSync -> ', content)
}
