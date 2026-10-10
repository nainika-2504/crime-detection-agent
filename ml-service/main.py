import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import numpy as np
import joblib

from train_model import train_and_save

app = FastAPI(
    title="AI Digital Crime Investigation ML Service",
    description="RandomForestClassifier inference service for digital crime forensic risk prediction",
    version="1.2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "model.joblib")
model_bundle = None

def get_model():
    global model_bundle
    if model_bundle is None:
        if not os.path.exists(MODEL_PATH):
            print("Model artifact not found. Training model now...")
            train_and_save()
        model_bundle = joblib.load(MODEL_PATH)
    return model_bundle

class PredictionRequest(BaseModel):
    transaction_amount: float = Field(..., ge=0)
    account_age_days: float = Field(..., ge=0)
    transaction_frequency: float = Field(..., ge=0)
    failed_login_attempts: int = Field(..., ge=0)
    new_device: bool = False
    multiple_transfers: bool = False
    unusual_location: bool = False
    previous_suspicious_activity: bool = False
    rapid_transfer: bool = False

class PredictionResponse(BaseModel):
    prediction: str
    probability: float
    risk_score: int
    risk_level: str
    model_version: str
    feature_importances: dict
    explanation: str
    recommended_checks: list[str]

@app.on_event("startup")
def startup_event():
    get_model()

@app.get("/health")
def health_check():
    bundle = get_model()
    return {
        "status": "UP",
        "service": "AI Digital Crime ML Predictor",
        "model_version": bundle.get("version", "RandomForestClassifier v1.2.0"),
        "features_count": len(bundle.get("feature_names", []))
    }

@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    bundle = get_model()
    clf = bundle["model"]
    feature_names = bundle["feature_names"]
    
    features = np.array([[
        request.transaction_amount,
        request.account_age_days,
        request.transaction_frequency,
        request.failed_login_attempts,
        int(request.new_device),
        int(request.multiple_transfers),
        int(request.unusual_location),
        int(request.previous_suspicious_activity),
        int(request.rapid_transfer)
    ]])
    
    prob = float(clf.predict_proba(features)[0, 1])
    is_suspicious = prob >= 0.5
    prediction = "SUSPICIOUS" if is_suspicious else "NORMAL"
    risk_score = int(round(prob * 100))
    
    if risk_score >= 80:
        risk_level = "CRITICAL"
    elif risk_score >= 60:
        risk_level = "HIGH"
    elif risk_score >= 35:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"
        
    importances = dict(zip(feature_names, [round(float(w), 4) for w in clf.feature_importances_]))
    
    explanations = []
    if request.previous_suspicious_activity:
        explanations.append("Entity has prior recorded suspicious incidents in intelligence ledger.")
    if request.failed_login_attempts >= 3:
        explanations.append(f"Recorded {request.failed_login_attempts} failed authentication attempts.")
    if request.unusual_location:
        explanations.append("Originating IP / jurisdiction deviates from historical profile.")
    if request.rapid_transfer:
        explanations.append("Rapid execution velocity matches structuring / smurfing heuristics.")
    if request.new_device:
        explanations.append("Unverified hardware agent detected without device certificate.")
    if request.account_age_days < 30:
        explanations.append("Account created fewer than 30 days ago.")
        
    if not explanations:
        if is_suspicious:
            explanations.append("Combined biometric and transaction anomaly weights exceeded critical risk tolerance.")
        else:
            explanations.append("Transaction parameters conform to verified baseline operational behavior.")
            
    recommended = []
    if is_suspicious:
        recommended.append("Apply automated hold on subsequent outbound wires.")
        recommended.append("Conduct out-of-band identity verification with account holder.")
        recommended.append("Verify network telemetry, origin IP address, and ASN logs against threat intelligence registries.")
    else:
        recommended.append("Standard periodic audit trail archival.")
        
    return PredictionResponse(
        prediction=prediction,
        probability=round(prob, 4),
        risk_score=risk_score,
        risk_level=risk_level,
        model_version=bundle.get("version", "RandomForestClassifier v1.2.0-prod"),
        feature_importances=importances,
        explanation=" ".join(explanations),
        recommended_checks=recommended
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
