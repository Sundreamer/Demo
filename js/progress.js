function progressBar(obj,dir){
	var btn = obj.getElementsByTagName("a")[0];
	var bar = obj.getElementsByTagName("div")[0];
	var pro = obj.getElementsByTagName("span")[0];
	var num = obj.getElementsByTagName("p")[0] || null;
	dir = (dir === false ? false : true);
	var loca, moveLoca, btnLoca, btnMoveLoca;
	var objSize = dir ? obj.offsetWidth : obj.offsetHeight,
		btnSize = dir ? btn.offsetWidth : btn.offsetHeight,
		objLeft = obj.offsetLeft,
		objTop = obj.offsetTop,
		bStyle = btn.style,
		pStyle = pro.style;

	// 改变进度条
	function drag(e){
		e = e || window.event;
		if (dir) {
			moveLoca = e.clientX - loca;
			btnMoveLoca = btnLoca + moveLoca + btnSize/2;
			if(btnMoveLoca >= 0 && btnMoveLoca <= objSize){
				bStyle.left = (btnMoveLoca - btnSize / 2) + "px";
				pStyle.width = btnMoveLoca + "px";
				tipShow();
			}
		}
		else{
			moveLoca = e.clientY - loca;
			btnMoveLoca = objSize - (btnLoca + moveLoca);
			if(btnMoveLoca >= 0 && btnMoveLoca <= objSize){
				bStyle.bottom = (btnMoveLoca - btnSize) + "px";
				pStyle.height = btnMoveLoca + "px";
				tipShow();
			}
		}
	}
	// 显示数字提示框
	function tipShow(){
		if(num){
			var nStyle = num.style;
			nStyle.top = (dir ? -btn.offsetHeight - 20 : -num.offsetHeight) + "px";
			nStyle.right = (dir ? -num.offsetWidth / 2 + btnSize / 2 : btn.offsetWidth + 5) + "px";
			num.innerHTML = btnMoveLoca;
			nStyle.display = "block";
		}
	}
	// 拖拽按钮改变进度
	btn.onmousedown = function(e){
		e = e || window.event;
		btnLoca = dir ? btn.offsetLeft : btn.offsetTop;
		loca = dir ? e.clientX : e.clientY;
		obj.onmousemove = drag;
	};
	btn.onmouseup = function(){
		num ? num.style.display = "none" : "";
		obj.onmousemove = null;
	};
	// 点击改变进度
	bar.onclick = function(e){
		e = e || window.event;
		var barSize = dir ? (e.clientX - objLeft) : (e.clientY - objTop);
		if (dir) {
			btnLoca = e.clientX - objLeft - btnSize / 2;
			bStyle.left = btnLoca + "px";
			pStyle.width = barSize + "px";
		} else {
			btnLoca = e.clientY - objTop + btnSize / 2;
			bStyle.bottom = objSize - btnLoca + "px";
			pStyle.height = objSize - barSize + "px";
		}
	};
}