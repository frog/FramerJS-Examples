# Module
ios = require 'ios-kit'
moment = require("npm").moment

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
	y: 400
	
bgData = [90, 115, 200, 180]
bgPos = null
bgReading = null
dots = []
startAnimation = 0
currT = 0.333333

s = (p)->
	pad = 50
	count = 12
	p.setup = ->
		p.createCanvas(Screen.width, Screen.width)
		createDots()
		
	p.draw = ->
		p.clear()
# 		drawBorder()
# 		drawCurve()
		animateCurve()
		
	drawBorder = ->
		p.stroke 255
		p.noFill()
		p.line 0, 0, p.width, 0
		p.line 0, p.height, p.width, p.height
		
	createDots = ->
		for i, d of bgData
			one = new Dot i, d
			dots.push one
		
	drawCurve = ->
		p.beginShape()
		p.curveVertex dots[0].x, dots[0].y
		for one in dots
			one.update()
			p.noFill()
			p.strokeWeight 5
			p.stroke 255
			p.curveVertex one.x, one.y
		p.curveVertex dots[dots.length - 1].x, dots[dots.length - 1].y
		p.endShape()
		
	drawForcast = (t) ->
		counts = 180
		steps = t * counts
		p.noFill()
		p.strokeWeight 5
		p.beginShape()
		solidRange = p.min steps, p.int(currT * counts)
		for i in [0..solidRange]
			s = t * i / steps
			one = p.getPosition s
			p.stroke 255
			p.vertex one.x, one.y
		p.endShape()
		if t > currT
			for i in [solidRange..steps - 3]
				if i % 3 == 0
					s0 = t * i / steps
					s1 = t * (i + 1) / steps
					p0 = p.getPosition s0
					p1 = p.getPosition s1
					c = p.lerpColor p.color(255), p.color(255,0,0), p.map(p0.y, 0, p.height*0.8, 1, 0)
					p.stroke c
					p.line p0.x, p0.y, p1.x, p1.y
		
	animateCurve = () ->
		if startAnimation < 0.96
			startAnimation += (1 - startAnimation) * 0.05
		else 
			startAnimation = 1
		drawForcast startAnimation
	p.getReading = (t) ->
		pos = p.getPosition t
		if pos == null
			return null
		result = p.map pos.y, 0, p.height, 300, 60
		return result.toFixed(0)
		
	p.getPosition = (t) ->
		if dots.length == 0 
			return null
		pi = p.min p.int(t / currT), 2
		p0i = p.max pi-1, 0
		p1i = pi
		p2i = pi + 1
		p3i = p.min pi + 2, 3
		nt = (t - pi * currT) / currT
		p0 = dots[p0i]
		p1 = dots[p1i]
		p2 = dots[p2i]
		p3 = dots[p3i]
		x = p.curvePoint p0.x, p1.x, p2.x, p3.x, nt
		y = p.curvePoint p0.y, p1.y, p2.y, p3.y, nt
		return p.createVector(x, y)
			
	class Dot
		constructor: (@i, @v) ->
			@t = @v
			@x = p.width/3 * @i
			@y = p.map @v, 60, 300, p.height, 0
		update: () ->
			@v += (@t - @v) * 0.1
			@x = p.width/3 * @i
			@y = p.map @v, 60, 300, p.height, 0
		display: () ->
			p.fill(255,0,0)
			p.noStroke()
			p.ellipse(@x, @y, 10, 10)
	return
	
myp5 = new p5(s, 'c1')

# UI
Screen.backgroundColor = "#69B2F4"

label = new Layer
	html: "Good Morning"
	backgroundColor: "transparent"
	width: Screen.width
	x: Align.center
	y: 150
	style:
		"font-family": "Serif"
		"font-weight": "bold"
		"font-size": "60px"
		"text-align": "center"
	
presetTime = moment("2010-10-20 8:08", "YYYY-MM-DD HH:mm")
time = presetTime.format('LT').toLowerCase()
timeLabel = new Layer
	backgroundColor: "transparent"
	width: 200
	height: 30
	style:
		'color': '#FFF'
		"font-size": "24px"
		"text-align": "center"
		"line-height": "30px"
	
bgPos = null
bgReading = null
	
bgLabel = new Layer
	backgroundColor: "#FFF"
	width: 0
	height: 0
	x: 0
	y: 0
	style:
		"border-radius": '50%'
		'color': '#69B2F4'
		"font-weight": "bold"
		"font-size": "36px"
		"text-align": "center"
		"line-height": "30px"
		"padding-top": "22px"
bgLabel.classList.add("bg-label")
viewT = currT

isOnDot = false
p5canvas.onTouchStart (event) ->
	pt = getOffsetPos(event)
	bgPos = myp5.getPosition viewT
	if myp5.dist(pt.x, pt.y, bgPos.x, bgPos.y) < 80
		isOnDot = true
		viewT = pt.x / Screen.width
		updateReading()
	return 

p5canvas.onTouchMove (event)->
	pt = getOffsetPos(event)
	if isOnDot
		viewT = pt.x / Screen.width
		updateReading()
	return
	 	
p5canvas.onTouchEnd ->
	isOnDot = false
	resetT()
	return
	
resetT = () ->
	resetAni = setInterval ( -> 
		viewT += (currT - viewT) * 0.2
		updateReading()
		if(Math.abs(viewT - currT) < 0.01)
			viewT = currT
			updateReading()
			clearInterval resetAni
	), 10
	
setTimeout ( ->
	bgPos = myp5.getPosition viewT
	bgReading = myp5.getReading viewT
	bgLabel.x = bgPos.x
	bgLabel.y = bgPos.y + 400
	popupAni = new Animation bgLabel,
		width: 100
		height: 100
		x: bgPos.x - 50
		y: bgPos.y + 400 - 50
		options:
			time: 0.6
			curve: Spring
	popupAni.start()
	popupAni.on Events.AnimationEnd, ->
		bgLabel.html = bgReading + '\n<span>MG/DL</span>'
		timeLabel.x = bgPos.x - 100
		timeLabel.y = bgPos.y + 270
		timeLabel.html = 'Now<br><b>' + time + '</b>'
), 600
		
updateReading = () ->
	bgPos = myp5.getPosition viewT
	bgReading = myp5.getReading viewT
	bgLabel.x = bgPos.x - 50
	bgLabel.y = bgPos.y + 400 - 50
	bgLabel.html = bgReading + '<br><span>MG/DL</span>'
	timeLabel.x = bgPos.x - 100
	timeLabel.y = bgPos.y + 270
	deltaTime = (viewT - currT) * 12
	future = presetTime.clone().add(deltaTime, 'hours')
	time = future.format('LT').toLowerCase()
	if( deltaTime == 0 )
		timeLabel.html = 'Now<br><b>' + time + '</b>'
	else
		timeLabel.html = 'Today<br><b>' + time + '</b>'
		
css = """
.bg-label span {
	font-size: 24px;
}
"""
Utils.insertCSS(css)
		
