import { IncomingForm } from 'formidable'

export default function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm()

    form.parse(req, (err, fields, files) => {
      if (err) reject(err)
      resolve({ fields, files })
    })
  })
}
