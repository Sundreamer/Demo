$(function(){
	var audio = document.querySelector('#audio');
	var listBox = document.querySelector(".listbox");
	var uploadBox = document.querySelector(".uploadbox");
	var addBox = document.querySelector(".addbox");
	var addList = document.querySelector(".addlist");
	var fileUpLoad = document.querySelector("#music");
	var index = 0, mode = 0, musicName = "", musicSrc = "";
	var playHistory = [], list = null, xhr = null,addFlag = true;

	loadList();

	audio.onended = function(){
		autoPlay(true,true);
	};
	audio.onpause = function(){
		list[index].className = "active";
	};
	audio.onplaying = function(){
		list[index].className = "active play";
	};
	// 播放上一首
	$("#prev").on("click",function(){
		if(playHistory.length == 0){
			autoPlay(false,false);
		}else{
			list[index].className = "";
			index = playHistory.pop();
			audio.src = list[index].dataset.src;
			list[index].className = "active play";
			move(index);
		}
	});
	// 播放下一首
	$("#next").on("click",function(){
		autoPlay(false,true);
	});
	// 切换歌曲播放模式
	$("#playmode").on("click",function(){
		mode += 1;
		mode = mode == 3 ? 0 : mode;
		$("#playmode").css("background-image","url(images/" + mode + ".png)");
		switch(mode){
			case 0 : $("#playmode").attr("title","列表循环");
			case 1 : $("#playmode").attr("title","单曲循环");
			case 2 : $("#playmode").attr("title","随机播放");
		}
	});
	// 显示添加歌曲框
	$("#addmusic").on("click",function(){
		addBox.style.opacity = "1";
		addBox.style.transform = "rotateY(-180deg)";
		addFlag?searchMusic():"";
	});
	// 显示上传歌曲框
	$("#upload").on("click",function(){
		uploadBox.style.zIndex = "99";
		uploadBox.style.opacity = "1";
		uploadBox.style.top = "50%";
		addBox.style.opacity = "0";
		addBox.style.transform = "rotateY(0deg)";
	});
	// 隐藏上传歌曲框
	$("#close").on("click",function(){
		uploadBox.style.zIndex = "-1";
		uploadBox.style.opacity = "0";
		uploadBox.style.top = "60%";
	});
	// 隐藏添加歌曲框
	$("#add-close").on("click",function(){
		addBox.style.opacity = "0";
		addBox.style.transform = "rotateY(0deg)";
	});
	// 点击确定按钮上传歌曲
	$("#submit").on("click",submitFile);
	// 选择好要上传的歌曲文件，将歌曲名显示在旁边
	fileUpLoad.onchange = function(){
		var info = $(".file p");
		var musicName = fileUpLoad.value;
		musicName = musicName.slice(musicName.lastIndexOf("\\")+1);
		info.text(musicName);
	};
	//在页面被关闭时，将歌曲列表的信息存储到localStorage中
	window.onunload = function(){
		var userList = listBox.innerHTML;
		localStorage.musiclist = userList; 
	};
	// 将存储在localStorage中的列表信息提取出来生成歌曲列表
	function loadList(){
		if(localStorage.musiclist){
			listBox.innerHTML = localStorage.musiclist;
		}
		playEvent();
		for(var i=0; i<list.length; i++){
			if(list[i].className.indexOf("active") >= 0){
				list[i].className = "active play"
				audio.src = list[i].dataset.src;
				index = i;
				break;
			}
		}
		move(index);
		index == 0?list[index].className = "active play":"";
	}
	// 切换播放歌曲
	function autoPlay(flag,dir){
		if(mode == 2){
			playHistory.push(index);
		}
		list[index].className = "";
		playMode(flag,dir);
		audio.src = list[index].dataset.src;
		list[index].className = "active play";
		move(index);
	};
	// 添加歌曲到播放列表中
	function addPlay(name,src){
		var li = document.createElement("li");
		li.appendChild(document.createTextNode(name));
		li.appendChild(document.createElement("i"));
		li.setAttribute("data-src",src);
		listBox.appendChild(li);
		playEvent();
	}
	// 播放列表里每首歌曲添加点击事件
	function playEvent(){
		list = listBox.children;
		for (var i = 0; i < list.length; i++) {
			(function(i){
				list[i].onclick = function(){
					if(index != playHistory[playHistory.length-1]){
						playHistory.push(index);
					}
					list[index].className = "";
					audio.src = list[i].dataset.src;
					list[i].className = "active play";
					index = i;
				};
				list[i].ondblclick = function(){
					list[i].style.height = "0px";
					audio.src = list[0].dataset.src;
					list[0].className = "active play";
					index = 0;
					setTimeout(function(){
						check(list[i]);
						listBox.removeChild(list[i]);
					},500);
				}
			})(i);
		}
	}
	// 添加列表里每首歌添加点击事件
	function addEvent(){
		var alist = addList.children;
		for(var i = 0; i < alist.length; i++){
			(function(i){
				alist[i].onclick = function(){
					if(alist[i].className == "disable"){
						showTip("歌曲已存在播放列表！");
					}else{
						var name = alist[i].innerText;
						var src = alist[i].dataset.src;
						addPlay(name,src);
						alist[i].className = "disable";
					}
				}
			})(i);
		}
	}
	// 不同播放模式下歌曲的切换方式
	function playMode(flag,dir){
		var lastIndex = index;
		var maxIndex = list.length - 1;
		if(mode == 2){
			while(index == lastIndex){
				index = parseInt(Math.random() * maxIndex);
			}
		}else{
			if(flag && mode == 1){
				audio.src = "";
			}else{
				dir ? index+=1 : index-=1;
				index = index < 0 ? maxIndex :index;
				index = index > maxIndex ? 0 : index;
			}				
		}
	}
	// 移动歌曲列表的滚动位置
	function move(index){
		var size = index * 30 - 90;
		var maxSize = list.length * 30 - 180;
		size = size < 0 ? 0 : size;
		size = size > maxSize?maxSize : size;
		listBox.scrollTop = size;
	}
	// 显示提示信息
	function showTip(info){
		var tipBox = $(".tipbox");
		tipBox.text(info);
		tipBox.css("animation","tip 2s 1");
		tipBox.css("z-index","99");
		setTimeout(function(){
			tipBox.css("animation","");
			tipBox.css("z-index","0");
		},3000);
	}
	// 检查添加列表
	function check(obj){
		var alist = addList.children;
		for(var i = 0; i<list.length; i++){
			for(var j = 0; j<alist.length; j++){
				if(alist[j].dataset.src == list[i].dataset.src){
					alist[j].className = "disable";
				}
				if(obj){
					if(alist[j].dataset.src == obj.dataset.src){
						alist[j].className = "";
					}
				}
			}
		}
	}
	// 提交按钮事件
	function submitFile(){
		musicName = uploadBox.children[1].value.trim();
		musicSrc = fileUpLoad.value;
		musicSrc = "media\\" + musicSrc.slice(musicSrc.lastIndexOf("\\")+1);
		if (musicSrc != "" && musicName != "") {
			if( musicSrc.indexOf(".mp3") == -1){
				showTip("请选择正确的歌曲文件！");
			}else{
				upLoadMusic();
				addBox.children[1].value = "";
				fileUpLoad.value = "";
				$("#submit").off("click",submitFile);
				$("#submit").css("background-color","#ccc");
			}	
		}else{
			showTip("歌曲名称不能为空！");
		}
	}
	// Ajax上传歌曲
	function upLoadMusic(){
		// 获取到要上传的文件
		var fileObj = fileUpLoad.files[0];
		// 设置文件在服务器的位置
		var fileControl = "musicManager.php";
		// 利用FormData对象，可以通过js用一些键值对来模拟一系列表单控件
		var form = new FormData();
		// 使用append方法添加key/value 来组成一个querystring
		form.append("music",fileObj);
		// 实例化一个XMLHttpRequest对象用于和服务器交互
		xhr = new XMLHttpRequest();
		// 发送异步请求需要设置onreadystatechange函数
		xhr.onreadystatechange = handleStateChange;
		// 规定请求类型、文件在服务器上的位置、是否异步
		xhr.open("POST",fileControl,true);
		// 将请求发送到服务器，仅限于POST请求
		xhr.send(form);
	}
	// 每当 readyState 改变时，就会触发 onreadystatechange 事件。
	function handleStateChange(){
	    if(xhr.readyState === 4){
	        if(xhr.status === 200){
	        	var result = xhr.responseText;
	            if(result == "上传成功"){
	            	addPlay(musicName,musicSrc);
	            	addFlag = true;
	            }
	            showTip(result + "!");
	        }
	    }
	    setTimeout(function(){
	    	$("#submit").on("click",submitFile);
			$("#submit").css("background-color","yellowgreen");
	    },1000);
	}
	// Ajax查询所有歌曲信息
	function searchMusic(){
		var fileControl = "musicManager.php"
		xhr = new XMLHttpRequest();
		xhr.onreadystatechange = allMusic;
		xhr.open("GET",fileControl,true);
		xhr.send();
	}
	// 将查询到的所有歌曲添加到列表中
	function allMusic(){
		if(xhr.readyState === 4){
			if(xhr.status === 200){
				var result = xhr.responseText;
				addList.innerHTML = result;
				check();
				addEvent();
				addFlag = false;
			}
		}
	}
});
