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
	}
};


/*  start a plugins of scroll  */

function fancyScroll(){
	this.main.apply(this, arguments);
}

fancyScroll.prototype = {
	outContent : null, //外层
	innerContent : null, //里层
	scrollContent : null, //滚动条包裹
	scrollspan : null, //滚动块
	nomalStyle : true,
	info : {           //滚动内容的基本信息
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
	},

	main : function(outContent){
		this.init(outContent);
	},
	init : function(outContent){
		this.outContent = U.byId(outContent);
		this.innerContent = U.getChildNode("fancy-scroll")[0];
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
		if(this.info.inHeight <= this.info.outHeight)return false;
		else{
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

			this.dragScroll();	
		}
	},
	dragScroll : function(){
		var self = this;
		U.addHandler(self.scrollspan, "mousedown", function(e){
			var e = e ? e : window.event;
			var originpos = e.clientY;
			var _this = this;

			this.info.scrollTop = this.scrollspan.offsetTop;
			this.info.scrollLeft = this.scrollspan.offsetLeft;

			
		});
	}
}

var fs = new fancyScroll("fancy-scroll");