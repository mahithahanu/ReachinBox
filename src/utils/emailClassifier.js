const axios = require('axios');

async function classifyEmail(emailText) {
  try {
    const response = await axios.post('https://ml-service-aux9.onrender.com/predict', {
      email_text: emailText
    });

    return response.data.label;
  } catch (error) {
    console.error('Error classifying email:', error.message);
    return null;
  }
}

module.exports = classifyEmail;
