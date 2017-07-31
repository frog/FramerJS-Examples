# Modules
ios = require 'ios-kit'

## Firebase
{Firebase} = require "firebase"
db = new Firebase
	projectID: "framerjs-54dfa"
	secret: "YTDXrYLqXWed6dtv5MhS7nNdkwDrtbKkVqqELHCE"

# UI
bgLayer = new Layer
	width: Screen.width
	height: Screen.height
	backgroundColor: "#00000"

stateText = new ios.Text
	text:"Select a state"
	fontSize:16
	fontWeight: 500
	width:320
	constraints:
		top: 80
		leading: 20

mButton = new ios.Button
	text:"Morning"
	buttonType:"small"
	color:"red"
	constraints:
		top: 120
		leading: 20
aButton = new ios.Button
	text:"Afternoon"
	buttonType:"small"
	color:"red"
	constraints:
		top: 120
		leading: [mButton, 40]
eButton = new ios.Button
	text:"Evening"
	buttonType:"small"
	color:"red"
	constraints:
		top: 120
		leading: [aButton, 40]
ios.layout.set()

mButton.onTap ->
	bgLayer.animate
		backgroundColor: "#FED931"
	stateText.animate
		color: "#000"
	db.put("/storyState", "morning")
aButton.onTap ->
	bgLayer.animate
		backgroundColor: "#62D7F9"
	stateText.animate
		color: "#000"
	db.put("/storyState", "afternoon")
eButton.onTap ->
	bgLayer.animate
		backgroundColor: "#324298"
	stateText.animate
		color: "#FFF"
	db.put("/storyState", "evening")


db.onChange "/storyState", (value) ->
	if value == "morning"
		bgLayer.animate
			backgroundColor: "#FED931"
	else if value == "afternoon"
		bgLayer.animate
			backgroundColor: "#62D7F9"
	else if value == "evening"
		bgLayer.animate
			backgroundColor: "#324298"
