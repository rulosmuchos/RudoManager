/*
 *	USE THIS COMMAND TO SYNCRONIZE TOONBOOM SCRIPT FILE WITH GIT FILE ( FILL PATH AS YOUR NEEDS )
 *	[PROJECT GIT PATH] "C:\Users\*\AppData\Roaming\Toon Boom Animation\Toon Boom Harmony Premium\1500-scripts" MrManager.js /MON:1
 *	eg: 
 robocopy C:\Users\andi\source\repos\digitalcapo\rudo-manager\mrToonBoom "C:\Users\andi\AppData\Roaming\Toon Boom Animation\Toon Boom Harmony Premium\1500-scripts" MrManager.js /MON:1
*/
function mrManagerUI() {
	// set local root path
	localPath = "C:/Users/andi/Documents/RudoManager/tb_script/";
	// set SHOWs folder
	showroot = System.getenv("SHOWS");
	// pipeline config.csv location 
	dbroot = "2_PRODUCTION/05_DB";
	// create scope variables for widget using
	configs = {};
	list = new Array();
	slist = new Array();
	selShots = new Array();
	info = new Array();
	selSeqName = "";
	filePath = "";
	// Load the ui file (created in Qt designer)
	dialogPath = localPath + "mrToonBoom.ui";
	var m_file = new File(dialogPath); //check for dialog file
	if (m_file.exists == true) {
		var ui = UiLoader.load(dialogPath);
		// create links to ui widgets
		tv = ui.listView;
		tv2 = ui.listView_2;
		listModel = new QStringListModel();
		slistModel = new QStringListModel();
	} else {
		// alert 'ui file not found'
	}
	// init 'Selected Shot Info' var
	var selShotInfo;
	var selShotName;
	// initialize dialog and widgets
	init = function () {
		// explore into show root directory
		var dbdir = new Dir(showroot);
		var dir_list = dbdir.entryList('*');
		for (i in dir_list) {
			// omit . and .. from showlists
			if (dir_list[i] != '.' && dir_list[i] != '..') {
				// look for config.csv on detected
				var csvFile = new File(showroot + '/' + dir_list[i] + '/' + dbroot + '/' + "config.csv");
				if (csvFile.exists == true) {// check file exists
					list.push(dir_list[i]);
					csvFile.open(1);
					arr = csvFile.read().split('\n');
					// separate headers and data
					var headers = arr[0].split(',');
					var data = arr[1].split(',');
					// csv to obj
					var obj = {};
					for (var j = 0; j < data.length; j++) {
						obj[headers[j].trim()] = data[j].trim();
					}
					// fill 'config' variable
					configs[dir_list[i]] = obj;
				}
			}
		}
		populateLayerList();
	}
	getSceneDetails = function () {
		// using file path, extract Show, Seq, Shot, Version
	}
	populateLayerList = function () {
		selection.selectAll();
		allLayers = selection.selectedNodes();
		var list = []
		for (var i in allLayers) {
			var n = allLayers[i];
			var type = node.type(n);
			if (type == "READ") {
				var attr = node.getAttrList(n, frame.current(), "");
				var nName = node.getName(n);
				list.push(nName)
			}
		}
		listModel.setStringList(list);
		tv.setModel(listModel);
	}
	//
	onLayerSelected = function (m, scope) {
		print(m.data());

	}
	/* PDF WRITE NODES FROM LAYERS*/
	// output path
	createWriteNodes = function (m, scope) {
		print('llega');
		var renderFolder = scope.showroot + '/' + scope.showFolder + '/2_PRODUCTION/03_ANIMATION/04_Compo/';
		selection.selectAll();
		allLayers = selection.selectedNodes();
		for (var i in allLayers) {
			var n = allLayers[i];
			var nName = node.getName(n);
			var type = node.type(n);
			// ONLY READ NODES
			if (type == "READ") {
				var attr = node.getAttrList(n, frame.current(), "");
				// CREATE A WRITE NODE FOR EVERY READ
				var w = node.add(node.root(), nName + "_writePDF", "WRITE", node.coordX(n), node.coordY(n) - 10, node.coordZ(n) + 1);
				// LINK READ AND WRITE
				node.link(n, 0, w, 0, true, true);
				// WEIRD ATTRIBUTES ACCESS
				var wAttr = node.getAttrList(w, frame.current(), "");
				for (var j in wAttr) {
					// SET WRITE ATTRIBUTES
					//print(wAttr[j].keyword() +" : "+wAttr[j].textValue());
					if (wAttr[j].keyword() == "DRAWING_TYPE") {
						wAttr[j].setValue("PDF");
					} else if (wAttr[j].keyword() == "DRAWING_NAME") {
						wAttr[j].setValue(n + ".pdf");
					}
					node.setTextAttr(w, "DRAWING_NAME", 0, renderFolder + "/" + scope.selSeqName + '/' + scope.selShotName + "/input/" + node.getName(n) + "/" + node.getName(n));
					node.setTextAttr(w, "MOVIE_PATH", 0, renderFolder + "/" + scope.selSeqName + '/' + scope.selShotName + "/input/" + node.getName(n) + "/" + node.getName(n));
				}
			}
		}
	}
	//
	checkIfTBFileExist = function (m, scope) {
		var filePath = scope.showroot + '/' + scope.showFolder + '/2_PRODUCTION/03_ANIMATION/02_SEQ/' + scope.selSeqName + '/' + scope.selShotName + '/' + scope.selShotName + ".xstage";
		scope.filePath = filePath;
		file = new File(filePath);
		return file.exists;
	}
	//
	// POPULATE LISTS
	//
	populateSequencesList = function (m, scope) {
	};
	populateShotsList = function (m, scope) {
	}
	populateShotsInfo = function (m, scope) {
	}
	//
	tvPressed = function (m) { this.onLayerSelected(m, this) }
	//
	tv.pressed.connect(this, tvPressed)
	//
	closeDialog = function () { ui.close() };
	//
	init();
	ui.show();
	//
	createNodesPressed = function (m) { this.createWriteNodes(m, this) };
	ui.createNodesButton.pressed.connect(this, createNodesPressed);
	//
}