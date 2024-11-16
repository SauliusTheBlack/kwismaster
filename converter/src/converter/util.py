class Settings:
	def __init__(self):
		self.error_messages = []
		self.sourceDir = None
		self.configFile = None
		self.projectDir = None
		self.baseInOutDir = None
		self.kwisMasterInOutDir = '.'

	def validate(self):
		self.error_messages = []
		if self.sourceDir is None:
			self.error_messages.append("SourceDir needs to be filled in")
		if self.projectDir is None:
			self.error_messages.append("ProjectDir needs to be filled in")

		return len(self.error_messages) == 0
