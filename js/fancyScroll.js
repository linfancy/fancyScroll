/* global function */
var U = {
	byId : function(name){
		return typeof name === "string" ? document.getElementById(name) : name;
	},
	byTag : function(name, parent){
		return (parent || document).getElementsByTagName(name);
	},
	byClass : function(name, parent){
		var aclass = [];
		var regClass = new RegExp("(^|)" + name + "(|$)");
		var aelem = this.byTag("*", parent);
		for(var i = 0; i < aelem.length; i++)regClass.test(aelem[i].className)&&(aclass.push(aelem[i]));
		return aclass;
	},
	hasClass : function(elem, oclass){
		return !!elem.className.match( new RegExp( "(\\s|^)" + oclass + "(\\s|$)") );	
	},
	removeClass : function(elem, oclass){
		if(this.hasClass(elem,oclass)){ 
			elem.className = elem.className.replace( new RegExp( "(\\s|^)" + oclass + "(\\s|$)" )," " ); 
		}
	},
	addClass : function(elem, oclass){
		if(!this.hasClass(elem,oclass)){ 
			elem.className += " " + oclass; 
		}
	},
	changeCss : function(elem, attr, value){
		switch(arguments.length){
			case 2 :
				if(typeof arguments[1] == "object"){
					for(var i in attr)
						i == "opacity" ? (elem.style["filter"] = "alpha(opacity=" + attr[i] + ")", (elem.style[i] = attr[i]/100) ): (elem.style[i] = attr[i]);
				}else{
					return elem.currentStyle ? elem.currentStyle[attr] : getComputedStyle(elem, null)[attr];
				}
				break;
			case 3 :
				attr === "opacity" ? (elem.style.filter = "alpha(opacity=" + value + ")",elem.style[attr] = value/100 ): (elem.style[attr] = value);
				break;
		}
	},
	addHandler : function(elem, oEvent, fnHandler){
		elem.addEventListener ? elem.addEventListener(oEvent, fnHandler, false) : elem.attachEvent("on"+oEvent, fnHandler);
	},
	removeHandler : function(elem, oEvent, fnHandler){
		elem.removeEventListener ? elem.removeEventListener(oEvent, fnHandler, false) : elem.detachEvent("on"+oEvent, fnHandler);
	},
	addLoadHandler : function(fnHandler){
		this.addHandler(window, "load", fnHandler);
	},

	getChildNode : function(oparent){
		var childNode = [];
		var node = typeof oparent == "object" ? oparent.childNodes : this.byId(oparent).childNodes;
		for(var i = 0; i < node.length; i++){
			if(node[i].nodeName != "#text" && (!/\s/.test(node[i].nodeValue))){
				childNode.push(node[i]);
			}
		}
		return childNode;
	},

	uniformMotion : function(elem, target, fn){
		elem.timer && clearInterval(elem.timer);
		elem.timer = setInterval(function(){
			doMove();
		}, 60);

		function doMove(){
			var speed = (target - elem.offsetTop) / 5;
			speed = speed > 0 ? Math.ceil(speed) : Math.floor(speed);
			if(Math.abs(elem.offsetTop-target) < 1){
				U.changeCss(elem, "top", target + "px");
				clearInterval(elem.timer);
				fn && fn();
			}
			U.changeCss(elem, "top", elem.offsetTop + speed + "px");
		}
	}
};


/*  start a plugins of scroll  */

function fancyScroll(){
	this.outContent = null;
	this.innerContent = null;//里层
	this.scrollContent = null;//滚动条包裹
	this.scrollspan = null;//滚动块
	this.nomalStyle = true;

	this.info = {//滚动内容的基本信息
		outWidth : 0,
		outHeight : 0,
		outLeft : 0,
		outRight : 0,
		inWidth : 0,
		inHeight : 0,
		inLeft : 0,
		inTop : 0,
		scrollTop : 0,
		scrollLeft : 0,
		scrollWidth : 0
	};

	this.main.apply(this, arguments);
}

fancyScroll.prototype = {
	main : function(outContent){
		this.init(outContent);
	},
	init : function(outContent){
		this.outContent = U.byId(outContent);
		this.innerContent = U.getChildNode(this.outContent)[0];
		this.getContentInfo();
		this.createScroll();
	},
	getContentInfo : function(){
		this.info.outWidth = this.outContent.clientWidth;
		this.info.outHeight = this.outContent.clientHeight;

		this.info.inWidth = this.innerContent.clientWidth;
		this.info.inHeight = this.innerContent.clientHeight;
		this.info.inLeft = this.innerContent.offsetLeft;
		this.info.inTop = this.innerContent.offsetTop;

		if(this.scrollspan){
			this.info.scrollTop = this.scrollspan.offsetTop;
			this.info.scrollLeft = this.scrollspan.offsetLeft;
		}
	},
	caculate : function(){
		if(this.info.inHeight <= this.info.outHeight){
			return false;
		}else{
			this.info.scrollWidth = this.info.outHeight / this.info.inHeight * this.info.outHeight;
		}
	},
	createScroll : function(){
		this.caculate();
		if(this.info.scrollWidth == 0)return false;
		else{
			this.scrollContent = document.createElement("div");
			this.scrollContent.className = "fancy-scrollContent";
			U.changeCss(this.scrollContent, "height", this.info.outHeight+"px");
			this.outContent.appendChild(this.scrollContent);

			this.scrollspan = document.createElement("div");
			this.scrollspan.className = "fancy-scrollSpan";
			U.changeCss(this.scrollspan, "height", this.info.scrollWidth+"px");
			this.scrollContent.appendChild(this.scrollspan);	

			this.dragScroll();	//绑定拖拽事件
			this.scrollScroll();
			this.touchScroll();
		}
	},
	dragScroll : function(){
		var self = this;
		U.addHandler(self.scrollspan, "mousedown", function(e){
			var e = e ? e : window.event;
			var originpos = e.clientY;
			var _this = this;

			self.caculateInfo();
			
			U.addHandler(document, "mousemove", scrollGo);
			U.addHandler(document, "mouseup", function(){
				U.removeHandler(document, "mousemove", scrollGo);
				U.removeHandler(document, "mouseup", null);
				self.info.scrollTop = self.scrollspan.offsetTop;
				self.info.scrollLeft = self.scrollspan.offsetLeft;
				return false;
			});

			function scrollGo(e){
				var oe = e ? e : window.event;
				var currentpos = e.clientY;
				var pos = currentpos - originpos + self.info.scrollTop;

				pos > self.info.outHeight - self.info.scrollWidth && (pos = self.info.outHeight - self.info.scrollWidth);
				pos < 0 && (pos = 0);

				U.changeCss(self.scrollspan, "top", pos+"px");

				var contentpos = self.info.inTop-((self.info.inHeight-self.info.outHeight)/(self.info.outHeight - self.info.scrollWidth) * (currentpos-originpos));

				contentpos < self.info.outHeight - self.info.inHeight && (contentpos = self.info.outHeight - self.info.inHeight);
				contentpos > 0 && (contentpos = 0);

				U.changeCss(self.innerContent, "top", contentpos+"px");
			}
		});
	},
	scrollScroll : function(){
		var self = this;
		U.addHandler(self.outContent, "mouseover", function(e){
			var e = e ? e : window.event;
			U.addHandler(self.outContent, "mousewheel", mouseWheel);
			U.addHandler(self.outContent, "DOMMouseScroll", mouseWheel);
			U.addHandler(window, "mousewheel", function(){return false});
			U.addHandler(window, "DOMMouseScroll", function(){return false});

			function mouseWheel(event){
				var delta = event.wheelDelta ? event.wheelDelta : -event.detail*40;
				var iTarget = delta > 0 ? -50 : 50;
				self.togetherMove(self.scrollspan.offsetTop + iTarget);
				if(event.stopPropagation){
					event.stopPropagation();
				}else{
					event.cancelBubble=true;
				}
				if (event.preventDefault) {
					event.preventDefault();	
				}else{
					return false;
				}
			}
			
			return false;
		});
	},
	togetherMove : function(target, fn){
		if(target <= 0){
			this.scrollspan.timer && clearInterval(this.scrollspan.timer);
			target = 0;
		}
		if(target >= this.info.outHeight - this.info.scrollWidth){
			this.scrollspan.timer && clearInterval(this.scrollspan.timer);
			target = this.info.outHeight - this.info.scrollWidth;	
		}
		U.uniformMotion(this.scrollspan, target);
		U.uniformMotion(this.innerContent, -(this.info.inHeight - this.info.outHeight)/(this.info.outHeight - this.info.scrollWidth)*target);
	},
	touchScroll : function(){
		var self = this;
		var startPos = null;
		var endPos = null;
		U.addHandler(self.innerContent, "touchstart", function(e){
			self.caculateInfo();
			var e = e ? e : window.event;
			var touch = e.targetTouches[0];
			startPos = {x:touch.pageX, y:touch.pageY};
			U.addHandler(self.innerContent, "touchmove", touchmove);
			U.addHandler(self.innerContent, "touchend", touchend);
		});

		function touchmove(event){
			var touch = event.targetTouches[0];
			endPos = {x:touch.pageX - startPos.x, y:touch.pageY - startPos.y};
			event.preventDefault && event.preventDefault();
			var pos = self.info.inTop + endPos.y;
			var spanpos = self.info.scrollTop - ((self.info.outHeight - self.info.scrollWidth)/(self.info.inHeight - self.info.outHeight)*endPos.y);

			pos > 0 && (pos = 0);
			pos < self.outContent.offsetHeight - self.innerContent.offsetHeight && (pos = self.outContent.offsetHeight - self.innerContent.offsetHeight);

			spanpos < 0 && (spanpos = 0);
			spanpos > self.info.outHeight - self.info.scrollWidth && (spanpos = self.info.outHeight - self.info.scrollWidth);
			U.changeCss(self.innerContent, "top", pos+"px");
			U.changeCss(self.scrollspan, "top", spanpos+"px");
		}

		function touchend(event){
			self.caculateInfo();
			if(endPos != null){
				var pos = self.info.inTop + (endPos.y/2);
				pos > 0 && (pos = 0);
				pos < self.outContent.offsetHeight - self.innerContent.offsetHeight && (pos = self.outContent.offsetHeight - self.innerContent.offsetHeight);

				var spanpos = self.info.scrollTop - ((self.info.outHeight - self.info.scrollWidth)/(self.info.inHeight - self.info.outHeight)*endPos.y);
				spanpos < 0 && (spanpos = 0);
				spanpos > self.info.outHeight - self.info.scrollWidth && (spanpos = self.info.outHeight - self.info.scrollWidth);

				U.uniformMotion(self.innerContent, pos);
				U.uniformMotion(self.scrollspan, spanpos);
				self.caculateInfo();
			}
			
		}
	},

	caculateInfo : function(){
		this.info.scrollTop = this.scrollspan.offsetTop;
		this.info.scrollLeft = this.scrollspan.offsetLeft;
		this.info.inTop = this.innerContent.offsetTop;
		this.info.inLeft = this.innerContent.offsetLeft;
	}
}

