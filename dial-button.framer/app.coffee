# Functions
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

# Canvas
p5canvas = new Layer
	html: '<div id="c1"></div>'
	width: Screen.width
	height: Screen.width
	backgroundColor: "transparent"
	x: 0
	y: 300

angle = 0

s = (p)->
	p.setup = ->
		p.createCanvas(Screen.width, Screen.width)

	p.draw = ->
		p.clear()
		drawBG()
		drawDial angle

	drawBG = ->
		p.fill 255
		p.noStroke()
		p.ellipse(p.width/2, p.height/2, p.width-180, p.width-180)

	drawDial = (a)->
		p.fill "#62D7F9"
		p.noStroke()
		p.push()
		p.translate p.width/2, p.width/2
		p.rotate a - p.PI/2
		p.rect 150, -15, p.width/2 - 270, 30, 30
		p.pop()

	return
myp5 = new p5(s, 'c1')

# UI
Screen.backgroundColor = "#62D7F9"

number = 0

label = new Layer
	html: "Dial"
	backgroundColor: "transparent"
	width: Screen.width
	x: Align.center
	y: 150
	style:
		"font-size": "120px"
		"text-align": "center"

numberLabel = new Layer
	html: number
	backgroundColor: "transparent"
	width: Screen.width
	x: Align.center
	y: 300 + Screen.width/2 - 15
	style:
		"font-size": "150px"
		"text-align": "center"
		"font-weight": "bold"
		"color": "#62D7F9"

rotatingDial = false

onDialTrack = (x, y) ->
	cx = Screen.width/2
	cy = Screen.width/2
	dist = Math.sqrt( Math.pow((x-cx), 2) + Math.pow((y-cy), 2) )
	return dist > 40 && dist < 400

getTouchAngle = (x, y) ->
	cx = Screen.width/2
	cy = Screen.width/2
	radians = (Math.atan2(y - cy, x - cx) + Math.PI/2 * 5) % (Math.PI * 2)
	result = radians * 180 / Math.PI
	return result

prevAngle = null
currAngle = null
p5canvas.onTouchStart (event) ->
	pt = getOffsetPos(event)
	isOnDial = onDialTrack(pt.x, pt.y)
	if isOnDial
		rotatingDial = true
		prevAngle = getTouchAngle pt.x, pt.y
	return

p5canvas.onTouchMove (event)->
	pt = getOffsetPos(event)
	isOnDial = onDialTrack(pt.x, pt.y)
	if isOnDial && rotatingDial
		currAngle = getTouchAngle pt.x, pt.y
		deltaAngle = currAngle - prevAngle
		if deltaAngle > 300
			deltaAngle -= 360
		if deltaAngle < -300
			deltaAngle += 360
		prevAngle = currAngle
		deltaNumber = myp5.map deltaAngle, 0, 360, 0, 100
		angle += deltaAngle/180*Math.PI
		number += deltaNumber
		numberLabel.html = number.toFixed(0)
	else if !isOnDial
		rotatingDial = false
	return

p5canvas.onTouchEnd ->
	p = getOffsetPos(event)
	rotatingDial = false
	return
