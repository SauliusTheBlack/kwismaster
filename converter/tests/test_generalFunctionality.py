from src.converter.convert import detectLanguage

def test_ifLineStartsWithLangeVraag_ThenLanguageIsDutch():
    assert detectLanguage("Lange Vraag") == "NL"
    assert detectLanguage("LANGE VRAAG") == "NL"
    assert detectLanguage("lange vraag") == "NL"
    assert detectLanguage("lange VRAAG") == "NL"
    assert detectLanguage("LANGE vraag") == "NL"
    assert detectLanguage("LANGE vraag: and then some useless data") == "NL"

def test_ifLineStartsWithLongQuestion_ThenLanguageIsDutch():
    assert detectLanguage("Long Question") == "EN"
    assert detectLanguage("LONG QUESTION") == "EN"
    assert detectLanguage("long question") == "EN"
    assert detectLanguage("LONG question") == "EN"
    assert detectLanguage("long QUESTION") == "EN"
    assert detectLanguage("Long Question: and then some useless data") == "EN"
