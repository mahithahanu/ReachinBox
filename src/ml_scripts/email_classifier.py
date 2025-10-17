import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import classification_report
import joblib
import nltk
import re
import os

nltk.download('stopwords')
from nltk.corpus import stopwords

CURRENT_FOLDER = os.path.dirname(os.path.abspath(__file__)) 
DATA_PATH = os.path.join(CURRENT_FOLDER, 'emails.csv')
MODEL_PATH = os.path.join(CURRENT_FOLDER, 'email_classifier.pkl')
VECTORIZER_PATH = os.path.join(CURRENT_FOLDER, 'vectorizer.pkl')

df = pd.read_csv(DATA_PATH)

def clean_text(text):
    text = str(text).lower() 
    text = re.sub(r'\W', ' ', text)  
    text = ' '.join([word for word in text.split() if word not in stopwords.words('english')])
    return text

df['clean_text'] = df['email_text'].apply(clean_text)

X_train, X_test, y_train, y_test = train_test_split(
    df['clean_text'], df['label'], test_size=0.2, random_state=42
)

vectorizer = TfidfVectorizer()
X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)

model = MultinomialNB()
model.fit(X_train_vec, y_train)

y_pred = model.predict(X_test_vec)
print("Classification Report:\n")
print(classification_report(y_test, y_pred))

joblib.dump(model, MODEL_PATH)
joblib.dump(vectorizer, VECTORIZER_PATH)

print("\nTraining complete! Model saved as 'email_classifier.pkl' and vectorizer as 'vectorizer.pkl' in the same folder.")
