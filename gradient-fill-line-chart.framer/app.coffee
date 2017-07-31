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

# Canvas

# Include a Layer 
p5canvas = new Layer
	html: '<div id="c1"></div>'
	backgroundColor: "transparent"
	x: 0
	y: Screen.height/2 - Screen.width/2
	width: Screen.width
	height: Screen.width

now = moment()
bgSets = []
nowPosX = 0
hourStepX = Math.round Screen.width / 3
minBG = 40
maxBG = 480

bgSegSets = []
t1 = 0
t2 = -50
t3 = -100

s = (p)->
	p.setup = ->
		p.createCanvas(Screen.width, Screen.width)
		p.createDataPoints()
		p.getDataSegments()
		
	p.draw = ->
		p.clear()
# 		p.background 255, 30
# 		drawDataCurve()
		if t1 < 0
			t1++
		else
			t1 += (1 - t1) * 0.03 if t1 < 0.8
			t1 += 0.01 if t1 >= 0.8
			t1 = 1 if t1 > 0.99
			drawSegmentCurve(0, t1)
		if t2 < 0
			t2++
			drawSegmentCurve(1, 0)
		else
			t2 += (1 - t2) * 0.04 if t2 < 0.8
			t2 += 0.01 if t2 >= 0.8
			t2 = 1 if t2 > 0.99
			drawSegmentCurve(1, t2)
		if t3 < 0
			t3++
			drawSegmentCurve(2, 0)
		else
			t3 += (1 - t3) * 0.05 if t3 < 0.8
			t3 += 0.01 if t3 >= 0.8
			t3 = 1 if t3 > 0.99
			drawSegmentCurve(2, t3)
	
	class DataPoint
		constructor: (@t, @v) ->
			this.update()
		update: () ->
			deltaHr = (@t.day() - now.day())*24 + @t.hour() - now.hour()
			@x = nowPosX + hourStepX * deltaHr
			@y = p.map @v, minBG, maxBG, p.height - 40, 40
		display: () ->
			p.noStroke()
			p.fill 255
			p.ellipse @x, @y, 10, 10
	
	p.createDataPoints = ->
		bgSets = []
		bgSegSets = []
		for i in [0..2]
			bgData = []
			bgData.push new DataPoint moment().subtract(1, 'hours'), 50
			bgData.push new DataPoint now, 60
			for i in [1..4]
				bgData.push new DataPoint moment().add(i, 'hours'), getRandomValue()
			bgSets.push bgData

	getRandomValue = ->
		if p.random(1) > 0.8
			return p.int(p.random(minBG, maxBG))
		return p.int(p.random(60, 240))
		
	p.getDataSegments = ->
		for bgData in bgSets
			bgSegments = []
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
			bgSegSets.push bgSegments
		
	drawDataCurve = ->
		p.noFill()
		p.stroke 255
		p.strokeWeight 4
		p.strokeCap(p.JOINT)
		p.beginShape()
		for one in bgData
			p.curveVertex one.x, one.y
		p.endShape()
		
	drawSegmentCurve = (index, t)->
		bgSegments = bgSegSets[index]
		gr = p.drawingContext.createLinearGradient 0, 0, 0, p.height
		gr.addColorStop 0, 'rgba(255,255,255,255)'
		gr.addColorStop 1, 'rgba(255,255,255,0)'
		p.drawingContext.fillStyle = gr
		p.drawingContext.fill()
		p.drawingContext.beginPath()
		p.drawingContext.moveTo 0, p.height
		end = Math.min(Math.round(p.width * t), p.width)
		for i in [0..end]
			if i % 10 == 0
				one = bgSegments[i]
				p.drawingContext.lineTo one.x, one.y
		p.drawingContext.lineTo end, p.height
		p.drawingContext.closePath()
		
myp5 = new p5(s, 'c1')

# UI
Screen.backgroundColor = "#32D2AF"

	
label = new Layer
	html: "Welcome Back"
	backgroundColor: "transparent"
	width: Screen.width
	x: Align.center
	y: 150
	style:
		"font-family": "Arial"
		"font-weight": "bold"
		"font-size": "60px"
		"text-align": "center"
	
nowT = moment().format('LT').toLowerCase()

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
		'color': '#32D2AF'
		"font-weight": "bold"
		"font-size": "90px"
		"text-align": "center"
		"line-height": "50px"
		"padding-top": "80px"
bgLabel.classList.add("bg-label")


bgLabel.x = Screen.width / 2
bgLabel.y = Screen.height / 2
popupAni = null
setTimeout ( ->
	popupAni = new Animation bgLabel,
		width: 240
		height: 240
		x: Screen.width / 2 - 120
		y: Screen.height / 2 - 120
		options:
			time: 0.6
			curve: Spring
	popupAni.start()
	popupAni.on Events.AnimationEnd, ->
		bgLabel.html ='115<br><span>MG/DL</span>'
		timeLabel.x = Screen.width / 2 - 100
		timeLabel.y = Screen.height / 2 - 200
		timeLabel.html = 'Now<br><b>' + nowT + '</b>'
), 2000

p5canvas.on Events.Tap, () ->
	myp5.noLoop()
	myp5.createDataPoints()
	myp5.getDataSegments()
	t1 = 0
	t2 = -50
	t3 = -100
	myp5.loop()
	popupAni.reset()
	bgLabel.x = Screen.width / 2
	bgLabel.y = Screen.height / 2
	bgLabel.width = 0
	bgLabel.height = 0
	bgLabel.html = ''
	timeLabel.x = -200
	timeLabel.y = -100
	setTimeout ( ->
		popupAni.start()
	), 2000
	
css = """
.bg-label span {
	font-size: 24px;
}
"""
Utils.insertCSS(css)
		
