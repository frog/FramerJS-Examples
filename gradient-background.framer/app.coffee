# Module
makeGradient = require("makeGradient")

# UI
# Screen.backgroundColor = "#69B2F4"

bgLayer = new Layer
	x: 0
	y: 0
	width: Screen.width
	height: Screen.height

makeGradient.linear bgLayer, ["#43F7CC", "#4F5AE6"]
