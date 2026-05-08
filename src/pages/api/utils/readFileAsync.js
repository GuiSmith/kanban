import fs from 'fs'

export default function readFileAsync(filepath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filepath, (err, data) => {
      if (err) reject(err)
      resolve(data)
    })
  })
}
