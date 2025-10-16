import axios from "axios";

// Function to call local Python Flask API for email classification
export async function categorizeEmail(emailText: string): Promise<string> {
  try {
    // Make a POST request to your local Flask API
    const response = await axios.post("http://127.0.0.1:5000/predict", {
      email_text: emailText
    });

    // Return the label predicted by the Python model
    return response.data.label;
  } catch (err: any) {
    console.error("Error categorizing email:", err.message || err);
    return "Not Categorized"; // fallback label if API fails
  }
}
