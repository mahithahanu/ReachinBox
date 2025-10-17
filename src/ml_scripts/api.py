from flask import Flask, request, jsonify
import joblib
import re
import nltk
from nltk.corpus import stopwords

nltk.download('stopwords')

app = Flask(__name__)

model = joblib.load('email_classifier.pkl')
vectorizer = joblib.load('vectorizer.pkl')

def clean_text(text):
    text = text.lower()
    text = re.sub(r'\W', ' ', text)
    text = ' '.join([word for word in text.split() if word not in stopwords.words('english')])
    return text

@app.route('/predict', methods=['POST'])
def predict():
    email_text = request.json.get('email_text', '')
    clean_email = clean_text(email_text)
    vectorized = vectorizer.transform([clean_email])
    prediction = model.predict(vectorized)[0]
    return jsonify({'label': prediction})

if __name__ == '__main__':
    app.run(port=5000, debug=True)
