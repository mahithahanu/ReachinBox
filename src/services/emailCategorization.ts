import axios from "axios";

export async function categorizeEmail(emailText: string): Promise<string> {
  try {
    const response = await axios.post("http://127.0.0.1:5000/predict", {
      email_text: emailText
    });

    return response.data.label;
  } catch (err: any) {
    console.error("Error categorizing email:", err.message || err);
    return "Not Categorized";
  }
}
