import { IncomingForm } from 'formidable';

export default function parseForm(req, options = {}) {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm(options);

    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}
