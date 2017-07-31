# Module
ios = require 'ios-kit'
makeGradient = require("makeGradient")
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
	
morningColor = new Color("#ff6a00").toHexString()
noonColor = new Color("#eaff00").toHexString()
eveningColor = new Color("#238050").toHexString()
nightColor = new Color("#001bb3").toHexString()

getDayColor = (hr)->
	result = null
	if hr < 6
		result = Color.mix(nightColor, morningColor, hr/6, true, "hsl")
	else if hr < 12
		result = Color.mix(morningColor, noonColor, hr/6 - 1, true, "hsl")
	else if hr < 18
		result = Color.mix(noonColor, eveningColor, hr/6 - 2, true, "hsl")
	else
		result = Color.mix(eveningColor, nightColor, hr/6 - 3, true, "hsl")
	return result

# Canvas
bgLayer = new Layer
	x: 0
	y: 0
	width: Screen.width
	height: Screen.height
	
scrollPaddingLeft = Screen.width
scroll = new ScrollComponent
	x: 0
	y: 400
	width: Screen.width
	height: Screen.width
scroll.contentInset =
    left: -scrollPaddingLeft
scroll.scrollVertical = false

# Include a Layer 
p5canvas = new Layer
	html: '<div id="c1"></div>'
	backgroundColor: "transparent"
	width: Screen.width * 4
	height: Screen.width
	parent: scroll.content

now = moment()
bgData = []
nowPosX = Math.floor Screen.width / 3 + scrollPaddingLeft
hourStepX = Math.floor Screen.width / 3
minBG = 40
maxBG = 480

bgSegments = []

s = (p)->
	p.setup = ->
		p.createCanvas(Screen.width * 4, Screen.width)
		createDataPoints()
		getDataSegments()
		
	p.draw = ->
		p.clear()
		drawSegmentCurve()
# 		p.background 255, 30
# 		drawDataCurve()
	
	class DataPoint
		constructor: (@t, @v) ->
			this.update()
		update: () ->
			deltaHr = @t.hour() - now.hour()
			deltaHr += 24 if deltaHr < -3
			@x = nowPosX + hourStepX * deltaHr
			@y = p.map @v, minBG, maxBG, p.height - 40, 40
		display: () ->
			p.noStroke()
			p.fill 255
			p.ellipse @x, @y, 10, 10
	
	createDataPoints = ->
		bgData.push new DataPoint moment().subtract(3, 'hours'), getRandomValue()
		bgData.push new DataPoint moment().subtract(2, 'hours'), getRandomValue()
		bgData.push new DataPoint moment().subtract(1, 'hours'), getRandomValue()
		bgData.push new DataPoint moment(), getRandomValue()
		for i in [1..11]
			bgData.push new DataPoint moment().add(i, 'hours'), getRandomValue()

	getRandomValue = ->
		if p.random(1) > 0.8
			return p.int(p.random(minBG, maxBG))
		return p.int(p.random(60, 240))
		
	drawDataCurve = ->
		p.noFill()
		p.stroke 255
		p.strokeWeight 4
		p.strokeCap(p.JOINT)
		p.beginShape()
		for one in bgData
			p.curveVertex one.x, one.y
		p.endShape()
		
	drawSegmentCurve = ->
		p.noFill()
		p.strokeJoin p.ROUND
		p.strokeCap p.SQUARE
		p.strokeWeight 4
		for i in [0..p.width-Screen.width/3*2]
			if i < nowPosX 
				if i % 5 == 0
					s0 = bgSegments[i]
					s1 = bgSegments[i+5]
					c = p.lerpColor p.color(255), p.color(255,0,0), p.map(s0.y, 0, p.height, 1, 0)
					p.stroke c
					p.line s0.x, s0.y, s1.x, s1.y
			else if i % 10 == 0
				s0 = bgSegments[i]
				s1 = bgSegments[i+5]
				c = p.lerpColor p.color(255), p.color(255,0,0), p.map(s0.y, 0, p.height, 1, 0)
				p.stroke c
				p.line s0.x, s0.y, s1.x, s1.y
				
		
	getDataSegments = ->
		for px in [0..p.width]
			d0 = d1 = bgData[0]
			d2 = d3 = bgData[bgData.length - 1]
			for i, one of bgData
				index = p.int i
				if one.x <= px
					d1 = one
					if i > 0
						d0 = bgData[i-1]
				if one.x > px
					d2 = one 
					if index < bgData.length - 2
						d3 = bgData[index+1]
					break
			t = (px - d1.x)	/ (d2.x - d1.x)
			x = p.curvePoint d0.x, d1.x, d2.x, d3.x, t
			y = p.curvePoint d0.y, d1.y, d2.y, d3.y, t
			z = Math.round p.map y, p.height - 40, 40, minBG, maxBG
			bgSegments.push	p.createVector(x, y, z)
	
myp5 = new p5(s, 'c1')

# UI
# Screen.backgroundColor = "#69B2F4"

greetingStr = 'Good Morning'
if now.hours() > 12
	greetingStr = 'Good Afternoon'
if now.hours() > 18
	greetingStr = 'Good Evening'
if now.hours() > 22
	greetingStr = 'Good Night'
	
label = new Layer
	html: greetingStr
	backgroundColor: "transparent"
	width: Screen.width
	x: Align.center
	y: 150
	style:
		"font-family": "Arial"
		"font-weight": "bold"
		"font-size": "60px"
		"text-align": "center"
	
nowT = now.format('LT').toLowerCase()
timeLabel = new Layer
	backgroundColor: "transparent"
	width: 200
	height: 30
	style:
		'color': '#FFF'
		"font-size": "24px"
		"text-align": "center"
		"line-height": "30px"	

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

currBG = null	
setTimeout ( ->
	currBG = bgSegments[nowPosX]
	if currBG != null
		bgLabel.x = currBG.x - scrollPaddingLeft
		bgLabel.y = currBG.y + 400
		popupAni = new Animation bgLabel,
			width: 100
			height: 100
			x: nowPosX - scrollPaddingLeft - 50
			y: currBG.y + 400 - 50
			options:
				time: 0.6
				curve: Spring
		popupAni.start()
		popupAni.on Events.AnimationEnd, ->
			bgLabel.html = currBG.z + '\n<span>MG/DL</span>'
			timeLabel.x = currBG.x - scrollPaddingLeft - 100
			timeLabel.y = currBG.y + 270
			timeLabel.html = 'Now<br><b>' + nowT + '</b>'
), 600

updateReading = (i) ->
	if i >= myp5.width-Screen.width/3*2
		return
	one = bgSegments[i]
	if one != null
		bgLabel.y = one.y + 400 - 50
		bgLabel.html = one.z + '\n<span>MG/DL</span>'
		timeLabel.y = one.y + 270
		deltaTime = ( i - nowPosX ) / hourStepX
		newTime = now.clone().add(deltaTime, 'hours')
		updateColor newTime.hours() + newTime.minutes() / 60
		if( Math.abs(i - nowPosX) <= 1 )
			timeLabel.html = 'Now<br><b>' + nowT + '</b>'
		else
			timeLabel.html = 'Today<br><b>' + newTime.format('LT').toLowerCase() + '</b>'

updateColor = (hr) ->
	currColor = getDayColor(hr)
	anotherColor = (currColor.darken 20).saturate 100
	bgLabel.style.color = anotherColor.toHexString()
	makeGradient.linear( bgLayer, [currColor.toHexString(), anotherColor.toHexString()] )	
updateColor now.hours() + now.minutes() / 60

scroll.onMove ->
	px = nowPosX + Math.round scroll.scrollX
	updateReading px
		
css = """
.bg-label span {
	font-size: 24px;
}
"""
Utils.insertCSS(css)
		
