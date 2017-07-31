# Modules

## Firebase
{Firebase} = require "firebase"
db = new Firebase
	projectID: "framerjs-54dfa"
	secret: "YTDXrYLqXWed6dtv5MhS7nNdkwDrtbKkVqqELHCE"

## BodyMovin
bodymovin = require("npm").bodymovin

# Functions

## Utils
containsPoint = (frame, point) ->
	return point.x > frame.x && point.x < frame.x+frame.width && point.y > frame.y && point.y <frame.y+frame.height

getDistance = (a, b) ->
	deltaX = a.x - b.x
	deltaY = a.y - b.y
	return Math.sqrt( deltaX*deltaX + deltaY*deltaY );

getOffsetPos = (event) ->
	rect = event.target.getBoundingClientRect()
	p =
		x: event.pageX - rect.left
		y: event.pageY - rect.top
	if event instanceof MouseEvent
		p =
			x: event.offsetX
			y: event.offsetY
	return p

## Typewriter
typeDelay = 0
typeLetter = (letter) ->
	typeDelay += Utils.randomNumber 0.05,0.15
	Utils.delay typeDelay, ->
		headline.html += letter
		return
typeLetters = (el, text, callback) ->
	typeDelay = 0
	el.html = ""
	letters = text.split('')
	for letter,i in letters
		typeLetter letter
	Utils.delay typeDelay, ->
		callback()
	return

## Face
faceLayer = null
mouthLayer = null
leftEyeAni = null
rightEyeAni = null
mouthAni = null
touchReady = false

loadAnimations = ()->
	leftEyeAniData = JSON.parse Utils.domLoadDataSync 'animations/lefteye.json'
	rightEyeAniData = JSON.parse Utils.domLoadDataSync 'animations/righteye.json'
	mouthAniData = JSON.parse Utils.domLoadDataSync 'animations/mouth.json'

	faceLayer = new Layer
		html: "<div id='leftEye'></div>"
		x: Align.center
		y: Align.bottom(-100)
		width: 560
		height: 560
		backgroundColor: "transparent"
		align: "center"
		borderWidth: 0

	leftEyeLayer = new Layer
		html: "<div id='leftEye'></div>"
		x: 0
		y: 0
		width: 560
		height: 560
		parent: faceLayer
		backgroundColor: "transparent"
	leftEyeAni = bodymovin.loadAnimation
		container: document.getElementById 'leftEye'
		renderer: 'svg'
		loop: false
		autoplay: false
		animationData: leftEyeAniData

	rightEyeLayer = new Layer
		html: "<div id='rightEye'></div>"
		x: 0
		y: 0
		width: 560
		height: 560
		parent: faceLayer
		backgroundColor: "transparent"
	rightEyeAni = bodymovin.loadAnimation
		container: document.getElementById 'rightEye'
		renderer: 'svg'
		loop: false
		autoplay: false
		animationData: rightEyeAniData

	mouthLayer = new Layer
		html: "<div id='mouth'></div>"
		x: 0
		y: 0
		width: 560
		height: 560
		parent: faceLayer
		backgroundColor: "transparent"
	mouthAni = bodymovin.loadAnimation
		container: document.getElementById 'mouth'
		renderer: 'svg'
		loop: false
		autoplay: false
		animationData: mouthAniData
	return

showFace = ()->
	touchReady = false
	leftEyeAni.play()
	rightEyeAni.play()

	Utils.delay 1, ->
		mouthAni.playSegments([0, 51], true)
		mouthAni.addEventListener "complete", ()->
			touchReady = true

hideFace = ()->
	leftEyeAni.goToAndStop(0)
	rightEyeAni.goToAndStop(0)
	mouthAni.playSegments([0, 1], true)
	mouthAni.goToAndStop(0)

# UI
bgLayer = new Layer
	backgroundColor: "#000"
	width: Screen.width
	height: Screen.height

line = new Layer
	backgroundColor: "#AEA743"
	x: 40
	y: 100
	width: Screen.width - 80
	height: 3

headline = new Layer
	html: ""
	backgroundColor: "Transparent"
	x: 40
	y: 150
	width: Screen.width - 80
	style:
		'font-family': "ChronicleDisp-Roman"
		'font-size': '120px'
		'line-height': '100px'
		'color': '#30439F'
		'text-align': 'top'

loadAnimations()
dragStartPos = null
mouthTouchArea = 0
aniFrame = null

faceLayer.onTouchStart (event) ->
	p = getOffsetPos(event)
	console.log p
	if not touchReady
		return
	centerFrame =
		x: 220
		y: 360
		width: 180
		height: 80
	cornerFrame =
		x: 400
		y: 360
		width: 180
		height: 80
	if containsPoint(centerFrame, p)
		dragStartPos = p
		mouthTouchArea = 1
		console.log '[mouth]drag started:', p
	else if containsPoint(cornerFrame, p)
		dragStartPos = p
		mouthTouchArea = 2
		console.log '[corner]drag started:', p
	return

faceLayer.onTouchMove (event)->
	p = getOffsetPos(event)
	if not touchReady
		return
	console.log 'draging: ', p
	if dragStartPos != null
		dragMovePos = p
		delta = getDistance(dragStartPos, dragMovePos)
		if mouthTouchArea == 1
			aniFrame = Math.floor Utils.modulate(delta, [0,100], [51, 86], true)
		else if mouthTouchArea == 2
			aniFrame = Math.floor Utils.modulate(delta, [0,100], [118, 147], true)
		console.log aniFrame
		mouthAni.playSegments([aniFrame, aniFrame+1], true)
	return

faceLayer.onTouchEnd ->
	p = getOffsetPos(event)
	if not touchReady
		return
	console.log 'drag ended:', p
	if dragStartPos != null
		dragMovePos = p
		delta = getDistance(dragStartPos, dragMovePos)
		if delta < 60
			if mouthTouchArea == 1
				mouthAni.playSegments([aniFrame, 51], true)
			else if mouthTouchArea == 2
				mouthAni.playSegments([aniFrame, 118], true)
		else
			touchReady = false
			if mouthTouchArea == 1
				mouthAni.playSegments([aniFrame, 96], true)
			else if mouthTouchArea == 2
				mouthAni.playSegments([aniFrame, 165], true)
		dragStartPos = null
	return

db.onChange "/storyState", (value) ->
	if value == "morning"
		bgLayer.animate
			backgroundColor: "#FED931"
		line.animate
			backgroundColor: "#AEA743"
		headline.style.color = "#30439F"
		hideFace()
		msg = "good morning, how are u?"
		typeLetters headline, msg, ()->
			showFace()
	else if value == "afternoon"
		bgLayer.animate
			backgroundColor: "#62D7F9"
		line.animate
			backgroundColor: "#2F96C1"
		headline.style.color = "#30439F"
		hideFace()
		msg = "good afternoon, how are u?"
		typeLetters headline, msg, ()->
			showFace()
	else if value == "evening"
		bgLayer.animate
			backgroundColor: "#324298"
		line.animate
			backgroundColor: "#3F7BB9"
		headline.style.color = "#62D7F9"
		hideFace()
		msg = "good evening, how are u?"
		typeLetters headline, msg, ()->
			showFace()
