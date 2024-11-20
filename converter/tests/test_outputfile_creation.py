import pathlib

from converter.file_creator import _writePresentationText, _writeAnswerText
from unittest.mock import patch, mock_open


from converter.question_parser import Question

minimumViableQuestion1 = Question()
minimumViableQuestion1.round = "TestRound"
minimumViableQuestion1.longQuestion = "What is the capital of France?"
minimumViableQuestion1.shortQuestion = "Capital of France?"
minimumViableQuestion1.answer = "Paris"

minimumViableQuestion2 = Question()
minimumViableQuestion2.round = "TestRound"
minimumViableQuestion2.longQuestion = "What is the capital of Belgium?"
minimumViableQuestion2.shortQuestion = "Capital of Belgium?"
minimumViableQuestion2.answer = "Brussels"

# Sample input for the test
roundObj = {
    "name": "TestRound",
    "questions": [minimumViableQuestion1, minimumViableQuestion2]
}
def test_ifPresentationTextIsWritten_thenContentIsCorrect():
    print("\n" + "DEBUG:" + str(pathlib.Path(__file__).parent.absolute()) + "\n")
    # Prepare the expected content that should be written to the file
    expected_content = """TestRound
1: What is the capital of France?
2: What is the capital of Belgium?
"""


    # Use mock_open with StringIO to simulate the file write
    mock_file = mock_open()
    with patch("builtins.open", mock_file):
        # Call the method
        _writePresentationText("dummy_folder", roundObj)

        # Retrieve the written content from the mock
        written_content = ""
        for made_call in mock_file().write.call_args_list:
            written_content += made_call[0][0]  # Accumulate written content
        written_content = written_content.replace("\\n","\n")

    # Assert that the written content matches the expected content
    assert expected_content.strip() == written_content.strip()

def test_ifPresentationTextIsWritten_thenAnswerTextIsCorrect():
    # Prepare the expected content that should be written to the file
    expected_content = """Antwoorden TestRound:
1: Capital of France?
\t- Paris

2: Capital of Belgium?
\t- Brussels
"""


    # Use mock_open with StringIO to simulate the file write
    mock_file = mock_open()
    with patch("builtins.open", mock_file):
        # Call the method
        _writeAnswerText("dummy_folder", roundObj)

        # Retrieve the written content from the mock
        written_content = ""
        for made_call in mock_file().write.call_args_list:
            written_content += made_call[0][0]  # Accumulate written content
        written_content = written_content.replace("\\n","\n")

    # Assert that the written content matches the expected content
    assert expected_content.strip() == written_content.strip()