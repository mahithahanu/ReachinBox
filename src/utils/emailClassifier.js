const axios = require('axios');

async function classifyEmail(emailText) {
  try {
    const response = await axios.post('http://127.0.0.1:5000/predict', {
      email_text: emailText
    });

    return response.data.label;
  } catch (error) {
    console.error('Error classifying email:', error.message);
    return null;
  }
}

module.exports = classifyEmail;
