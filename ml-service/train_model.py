import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score
import joblib
import os

def generate_crime_dataset(n_samples=5000, random_state=42):
    np.random.seed(random_state)
    
    # Features:
    # 0: transaction_amount (10 to 150000)
    # 1: account_age_days (1 to 2000)
    # 2: transaction_frequency (1 to 80)
    # 3: failed_login_attempts (0 to 10)
    # 4: new_device (0 or 1)
    # 5: multiple_transfers (0 or 1)
    # 6: unusual_location (0 or 1)
    # 7: previous_suspicious_activity (0 or 1)
    # 8: rapid_transfer (0 or 1)
    
    amount = np.random.exponential(scale=8000, size=n_samples) + 20
    age = np.random.exponential(scale=400, size=n_samples) + 1
    freq = np.random.poisson(lam=12, size=n_samples)
    failed_logins = np.random.poisson(lam=0.8, size=n_samples)
    new_device = np.random.binomial(1, 0.25, size=n_samples)
    multiple_transfers = np.random.binomial(1, 0.18, size=n_samples)
    unusual_location = np.random.binomial(1, 0.15, size=n_samples)
    prev_suspicious = np.random.binomial(1, 0.10, size=n_samples)
    rapid_transfer = np.random.binomial(1, 0.14, size=n_samples)
    
    X = np.column_stack([
        amount, age, freq, failed_logins,
        new_device, multiple_transfers, unusual_location,
        prev_suspicious, rapid_transfer
    ])
    
    # Latent crime risk probability
    logits = (
        (amount > 20000) * 1.5 +
        (age < 45) * 1.8 +
        (failed_logins >= 3) * 2.2 +
        new_device * 1.1 +
        multiple_transfers * 1.3 +
        unusual_location * 1.6 +
        prev_suspicious * 2.5 +
        rapid_transfer * 1.7 -
        4.2
    )
    
    probs = 1.0 / (1.0 + np.exp(-logits))
    y = (np.random.rand(n_samples) < probs).astype(int)
    
    return X, y

def train_and_save():
    print("Generating digital crime training corpus...")
    X, y = generate_crime_dataset(6000)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training RandomForestClassifier...")
    clf = RandomForestClassifier(
        n_estimators=100,
        max_depth=12,
        min_samples_split=4,
        random_state=42,
        class_weight='balanced'
    )
    clf.fit(X_train, y_train)
    
    preds = clf.predict(X_test)
    probs = clf.predict_proba(X_test)[:, 1]
    
    print("Model Evaluation:")
    print(classification_report(y_test, preds))
    print(f"ROC AUC: {roc_auc_score(y_test, probs):.4f}")
    
    output_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(output_dir, "model.joblib")
    
    payload = {
        "model": clf,
        "feature_names": [
            "transaction_amount",
            "account_age_days",
            "transaction_frequency",
            "failed_login_attempts",
            "new_device",
            "multiple_transfers",
            "unusual_location",
            "previous_suspicious_activity",
            "rapid_transfer"
        ],
        "version": "RandomForestClassifier v1.2.0-prod"
    }
    
    joblib.dump(payload, model_path)
    print(f"Model successfully serialized to {model_path}")

if __name__ == "__main__":
    train_and_save()
