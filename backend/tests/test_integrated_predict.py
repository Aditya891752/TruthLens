import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.ml.model import TruthLensMLClassifier

clf = TruthLensMLClassifier()
loaded = clf.load(os.path.join(os.path.dirname(__file__), "..", "app", "ml"))
print("Model loaded:", loaded)

claim = "Tunisia's capital is Tunis."
ev = "Reference note: Reference works list Tunis as the capital of Tunisia."
label, conf = clf.predict(claim, ev)
print("ML Prediction with retrieved evidence:", label, f"{conf*100:.1f}%")

claim2 = "Mercury is abbreviated Cl."
ev2 = "Correct fact: Mercury: symbol Hg"
label2, conf2 = clf.predict(claim2, ev2)
print("ML Prediction for false claim:", label2, f"{conf2*100:.1f}%")
