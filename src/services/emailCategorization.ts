import axios from "axios";

export async function categorizeEmail(emailText: string): Promise<string> {
  try {
    const response = await axios.post("https://ml-service-aux9.onrender.com/predict", {
      email_text: emailText
    });

    return response.data.label;
  } catch (err: any) {
    console.error("Error categorizing email:", err.message || err);
    return "Not Categorized";
  }
}
