from converter.convert import detectLanguage
from converter.util import Settings

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

def test_ifNoRequiredFieldsAreNotSet_ThenSettingsDoesntValidate_andMultipleErrorMessagesExist():
    settings = Settings()
    assert settings.validate() == False
    assert len(settings.error_messages) == 2
    assert "SourceDir needs to be filled in" in settings.error_messages
    assert "ProjectDir needs to be filled in" in settings.error_messages

def test_ifNoSourceDirIsSet_ThenSettingsDoesntValidate():
    settings = Settings()
    settings.projectDir = "."
    assert settings.validate() == False
    assert "SourceDir needs to be filled in" in settings.error_messages

def test_ifNoProjectDirIsSet_ThenSettingsDoesntValidate():
    settings = Settings()
    settings.sourceDir = "."
    assert settings.validate() == False
    assert "ProjectDir needs to be filled in" in settings.error_messages

