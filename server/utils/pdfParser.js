const pdf = require('pdf-parse');

const parsePDF = async (buffer) => {
  try {
    const data = await pdf(buffer);
    return { text: data.text, pages: data.numpages };
  } catch (err) {
    throw new Error('PDF parsing failed');
  }
};

module.exports = parsePDF;
