# Module
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
p5canvas = new Layer
	html: '<div id="c1"></div>'
	width: Screen.width
	height: Screen.width
	backgroundColor: "transparent"
	x: 0
	y: 300

bgData = []
isigData = []

s = (p)->
	table = null

	index = 0
	rowCount = 0
	dot = null

	p.preload = ->
		table = p.loadTable("cgm.csv", "csv", "header")
	p.setup = ->
		p.frameRate = 30
		p.createCanvas(Screen.width, Screen.width)
		rowCount = table.getRowCount()
		dot = new Dot -100

	p.draw = ->
		p.clear()
		if p.frameCount % 60 == 0
			index = (index + 1) % rowCount
			row = table.getRow index
			isig = row.get 0
			datetime = row.get 1
			bg = row.get 2
			bgData.push bg
			isigData.push bg / isig
			if bgData.length > 100
				bgData.shift()
			if isigData.length > 100
				isigData.shift()
			dot.t = bg
			updateReading datetime, p.map bg, 40, 400, p.height - 50 , 50

		if bgData.length > 1

			# draw isig
			p.stroke 255, 0
			one = isigData[0]
			ix = p.width/3*2 - isigData.length * 10
			iy = p.map one, 0, 30, p.height - 50 , 50
			for i, one of isigData
				pi = parseInt(i)
				ix = p.width/3*2 - (isigData.length - pi) * 10
				iy = p.map one, 0, 30, p.height - 50 , 50
				p.fill "#081C9D"
				p.rect ix, iy, 8,8

			# draw data
			p.stroke 255
			p.strokeWeight 4
			p.noFill()
			p.beginShape()
			one = bgData[0]
			px = p.width/3*2 - bgData.length * 10
			py = p.map one, 40, 400, p.height - 50 , 50
			p.curveVertex px, py
			for i, one of bgData
				pi = parseInt(i)
				px = p.width/3*2 - (bgData.length - pi) * 10
				py = p.map one, 40, 400, p.height - 50 , 50
				p.curveVertex px, py
			p.curveVertex px, py
			p.endShape()


		dot.update()
		dot.display()

	class Dot
		constructor: (@v) ->
			@t = @v
			@x = p.width/3 * 2
			@y = p.map @v, 40, 400, p.height - 50, 50
		update: () ->
			@v += (@t - @v) * 0.2
			@x = p.width/3 * 2
			@y = p.map @v, 40, 400, p.height - 50 , 50
		display: () ->
			p.stroke(255, 90)
			p.strokeWeight 10
			p.noFill()
			p.ellipse(@x, @y, 100, 100)
			p.fill(255)
			p.noStroke()
			bgStr= @v.toFixed(0)
			p.textSize(40)
			p.textAlign(p.CENTER)
			p.text(bgStr, @x-45, @y-25, 100, 100)
	return

myp5 = new p5(s, 'c1')

# UI
# Screen.backgroundColor = "#69B2F4"

bgLayer = new Layer
	x: 0
	y: 0
	width: Screen.width
	height: Screen.height
bgLayer.placeBehind p5canvas

makeGradient.linear bgLayer, ["#43F7CC", "#4F5AE6"]

label = new Layer
	html: "14 Year Old"
	backgroundColor: "transparent"
	width: Screen.width
	x: Align.center
	y: 150
	style:
		"font-family": "Serif"
		"font-weight": "bold"
		"font-size": "60px"
		"text-align": "center"

bgLabel = new Layer
	backgroundColor: "transparent"
	width: 200
	height: 40
	x: Screen.width/3 * 2 - 100
	y: Screen.height
	style:
		"border-radius": '50%'
		'color': '#fff'
		"font-weight": "bold"
		"font-size": "27px"
		"text-align": "center"
		"line-height": "30px"
		"padding-top": "22px"
bgLabel.classList.add("bg-label")

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

updateReading = (da, y) ->
	bgLabel.y = y + 350
	dt = moment(da, "YYYY-MM-DD HH:mm:ss")
	bgLabel.html = dt.format('LT') + '<br><span>' + dt.format('ll') + '</span>'

css = """
.bg-label span {
	font-size: 20px;
}
"""
Utils.insertCSS(css)
