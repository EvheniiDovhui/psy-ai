from app.core.analyzer import analyze_text

def test_analysis():
    text = "Мені тривожно, але я хочу розвитку і сенсу"
    profile = analyze_text(text)
    assert profile.big_five["openness"] >= 0