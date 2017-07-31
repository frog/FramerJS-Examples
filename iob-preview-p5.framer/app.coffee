# Module
ios = require 'ios-kit'
moment = require("npm").moment

# Canvas
p5canvas = new Layer
	html: '<div id="c1"></div>'
	width: Screen.width
	height: Screen.width
	backgroundColor: "transparent"
	x: 0
	y: 300
	
longPressStart = null
longPressEnd = null

s = (p)->
	tl = Screen.width / 2 - 100
	tr = Screen.width / 2 + 100
	tt = Screen.width * 0.2
	tb = Screen.width * 0.8
	tw = tr - tl
	th = tb - tt
	inc = 0.005
	
	value = 1
	time = moment().format('LT').toLowerCase()
	
	pressStarted = false
	
	p.setup = ->
		p.createCanvas(Screen.width, Screen.width)
		
	p.draw = ->
		p.clear()
		drawTube()
		if pressStarted && value > 0 
			value -= inc
			tInc = 5 * (1 - value)
			time = moment().add(tInc, 'hours').format('LT').toLowerCase()
			tLabel.html = time + '<br>'+ p.abs(value * 10).toFixed(2) + ' units'
		if value > 0 || !pressStarted
			drawWave(value)
		
	drawTube = ->
		p.noFill()
		p.stroke 255
		p.strokeWeight 1
		p.line tl, tt, tl, tb
		p.line tr, tt, tr, tb
		p.line tl, tb, tr, tb
		 	
	longPressStart = () ->
		pressStarted = true
		return
	longPressEnd = () ->
		pressStarted = false
		value = 1
		time = moment().format('LT').toLowerCase()
		tLabel.html = time + '<br>10 units'
		return 
		
	params = 
		AMPLITUDE_WAVES: th/15
		AMPLITUDE_MIDDLE: th/30
		AMPLITUDE_SIDES: th/15
		OFFSET_SPEED: 60
		SPEED: 3
		OFFSET_WAVES: 30
		NUMBER_WAVES: 2
		NUMBER_CURVES: 3
		OFFSET_CURVE: true
		RESET: false
		
	speedInc = 0
	drawWave = (per)->
		p.push()
		p.translate tl, tt
		p.noStroke()
		amount = p.map per, 0, 1, th*1, th*0.1
		c = p.map per, 0, 1, 0, 255
		for j in [params.NUMBER_WAVES-1.. 0]
			offset = speedInc + j * Math.PI * params.OFFSET_WAVES
			p.fill 255, c, c, 1.0 / params.NUMBER_WAVES * 240.0
			leftRange = ((Math.sin((offset / params.OFFSET_SPEED) + 2) + 1) / 2 * params.AMPLITUDE_SIDES) + amount
			rightRange = ((Math.sin((offset / params.OFFSET_SPEED) + 2) + 1) / 2 * params.AMPLITUDE_SIDES) + amount
			leftCurveRange = (Math.sin((offset / params.OFFSET_SPEED) + 2) + 1) / 2 * params.AMPLITUDE_WAVES + amount
			rightCurveRange = (Math.sin((offset / params.OFFSET_SPEED) + 1) + 1) / 2 * params.AMPLITUDE_WAVES + amount
			endCurveRange = ((Math.sin((offset / params.OFFSET_SPEED) + 2) + 1) / 2 * params.AMPLITUDE_MIDDLE) + amount
			reverseLeftCurveRange = (endCurveRange - rightCurveRange) + endCurveRange
			reverseRightCurveRange = (endCurveRange - leftCurveRange) + endCurveRange
			if params.OFFSET_CURVE == false
				leftCurveRange = rightCurveRange
				reverseRightCurveRange = reverseLeftCurveRange
			p.beginShape()
			p.vertex 0, leftRange
			p.bezierVertex tw / (params.NUMBER_CURVES * 3), leftCurveRange, tw / (params.NUMBER_CURVES * 3 / 2), rightCurveRange, tw / params.NUMBER_CURVES, endCurveRange
			for i in [1..params.NUMBER_CURVES - 1]
				lastRange = 0
				if i == params.NUMBER_CURVES - 1
					lastRange = rightRange
				else
					lastRange = endCurveRange
				if i%2 != 0
					p.bezierVertex tw * (i / params.NUMBER_CURVES) + tw / (params.NUMBER_CURVES * 3), (endCurveRange - rightCurveRange) + endCurveRange, tw * (i / params.NUMBER_CURVES) + tw * (2 / (params.NUMBER_CURVES * 3)), (endCurveRange - leftCurveRange) + endCurveRange, tw * ((i + 1) / params.NUMBER_CURVES), lastRange
				else
					p.bezierVertex tw * (i / params.NUMBER_CURVES) + tw / (params.NUMBER_CURVES * 3), (endCurveRange - reverseRightCurveRange) + endCurveRange, tw * (i / params.NUMBER_CURVES) + tw * (2 / (params.NUMBER_CURVES * 3)), (endCurveRange - reverseLeftCurveRange) + endCurveRange, tw * ((i + 1) / params.NUMBER_CURVES), lastRange
			p.vertex tw, th
			p.vertex 0, th
			p.vertex 0, rightRange
			p.endShape()
		speedInc += params.SPEED
		p.pop()
	return
	
myp5 = new p5(s, 'c1')

# UI
Screen.backgroundColor = "#0033CC"

currTime = moment().format('LT').toLowerCase()
tLabel = new Layer 
	html: currTime + '<br>10 units'
	backgroundColor: 'transparent'
	color: 'white'
	width: Screen.width
	x: 0
	y: 150
	style:
		'text-align': 'center'
		'font-size': '40px'
		'line-height': '54px'
		
label = new Layer
	html: "preview your IOB<br>by long press on the tube"
	backgroundColor: "transparent"
	width: Screen.width
	x: Align.center
	y: 300 + Screen.width
	style:
		"font-size": "40px"
		"text-align": "center"
		"line-height": "54px"
		
#Events
p5canvas.on Events.LongPressStart, (event) ->
    longPressStart()
p5canvas.on Events.LongPressEnd, (event) ->
	longPressEnd()