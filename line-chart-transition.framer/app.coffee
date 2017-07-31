# Module
ios = require 'ios-kit'

# Canvas
p5canvas = new Layer
	html: '<div id="c1"></div>'
	width: Screen.width
	height: Screen.width
	backgroundColor: "transparent"
	x: 0
	y: 200
	
novoData = [0, 2, 8, 10, 8, 5, 2, 0.5, 0.1, 0, 0, 0]
humaData = [0, 5, 10, 8, 5, 2.5, 1, 0.2, 0, 0, 0, 0]
dots = []
updateDots = null

s = (p)->
	pad = 50
	count = 12
	p.setup = ->
		p.createCanvas(Screen.width, Screen.width)
		createDots()
		updateDots(novoData)
		
	p.draw = ->
		p.clear()
		drawBG()
		drawDots()
		
		
	drawBG = ->
		tw = p.width - pad * 2
		p.stroke(255, 120)
		p.strokeWeight 1
		p.noFill()
		step = tw / (count - 1)
		p.push()
		p.translate(pad, pad)
		for i in [0..count-1]
			p.line(0, i*step, tw, i*step)	
			p.line(i*step, 0, i*step, tw)
		p.pop()
	
	createDots = ->
		tw = p.width - pad * 2
		step = tw / (count - 1)
		for i in [0..count-1]
			one = new Dot step*i + pad, p.height - pad
			dots.push one
	
	updateDots = (d) ->
		for i, one of d
			val = p.map one, 0, 10, p.height - pad, pad
			dots[i].t = val
	
	drawDots = ->		
		p.noFill()
		p.strokeWeight 5
		p.stroke 255, 255, 0
		
		p.beginShape()
		p.curveVertex dots[0].x, dots[0].y
		for one in dots
			one.update()
			p.noFill()
			p.strokeWeight 5
			p.stroke 255, 255, 0
			p.curveVertex one.x, one.y
		p.curveVertex dots[dots.length - 1].x, dots[dots.length - 1].y
		p.endShape()
	
	class Dot
		constructor: (@x, @y) ->
		update: () ->
			@y += (@t - @y) * 0.1
		display: () ->
			p.fill(255,0,0)
			p.noStroke()
			p.ellipse(@x, @y, 10, 10)
	return
myp5 = new p5(s, 'c1')

# UI
Screen.backgroundColor = "#0033CC"

label = new Layer
	html: "pick your insulin"
	backgroundColor: "transparent"
	width: Screen.width
	x: Align.center
	y: 100
	style:
		"font-size": "40px"
		"text-align": "center"

button1 = new Layer
	backgroundColor: "#0033cc"
	html: "Novorapid"
	x: 50
	y: Screen.height - 100
	style:
		"font-size": "30px"
		
button2 = new Layer
	backgroundColor: "#0033cc"
	html: "Humalog"
	x: Screen.width - 160
	y: Screen.height - 100
	style:
		"font-size": "30px"
		"color": "#aaa"
	
button1.on 'click', ->
	button1.style.color = "#fff"
	button2.style.color = "#aaa"
	updateDots novoData
	
button2.on 'click', ->
	button1.style.color = "#aaa"
	button2.style.color = "#fff"
	updateDots humaData
	
xLabel = new Layer 
	html: 'Time (hrs)'
	backgroundColor: 'transparent'
	color: 'white'
	fontSize: 18
	fontWeight: 200
	width: Screen.width
	x: 0
	y: 160 + Screen.width
	style:
		'text-align': 'center'
		
yLabel = new Layer 
	html: 'Insulin Effect'
	backgroundColor: 'transparent'
	color: 'white'
	fontSize: 18
	fontWeight: 200
	style:
		'top': '500px'
		'transform-origin': 'left'
		'transform': 'translate(110px, 0px) rotate(-90deg)'
		
