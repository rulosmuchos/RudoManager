/*
 *	USE THIS COMMAND TO SYNCRONIZE TOONBOOM SCRIPT FILE WITH GIT FILE ( FILL PATH AS YOUR NEEDS )
 *	[PROJECT GIT PATH] "C:\Users\*\AppData\Roaming\Toon Boom Animation\Toon Boom Harmony Premium\1500-scripts" MrManager.js /MON:1
 *	eg: 
 robocopy C:\Users\andi\source\repos\digitalcapo\rudo-manager\mrToonBoom "C:\Users\andi\AppData\Roaming\Toon Boom Animation\Toon Boom Harmony Premium\1500-scripts" MrManager.js /MON:1
*/
function mrManagerUI() {
	// set local root path
	localPath = "C:/Users/andi/Source/Repos/digitalcapo/rudo-manager/mrToonBoom/";
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
	dialogPath = localPath + "mrToonBoom_2.ui";
	var m_file = new File(dialogPath); //check for dialog file
	if (m_file.exists == true) {
		var ui = UiLoader.load(dialogPath);
		// create links to ui widgets
		tv = ui.listView;
		tv2 = ui.listView_2;
		tv3 = ui.listView_3;
		tv4 = ui.listView_4;
		loadButton = ui.loadButton;
		// create widgets data models
		listModel = new QStringListModel();
		slistModel = new QStringListModel();
		shotListModel = new QStringListModel();
		shotInfoModel = new QStringListModel();

	} else {
		// alert 'ui file not found'
	}
	// init 'Selected Shot Info' var
	var selShotInfo;
	var selShotName;
	// freak var watch event for selShotInfo
	Object.defineProperty(this, 'selShotInfo', {
		get: function () { return selShotInfo; },
		set: function (v) {

			if (v != "") {
				myVar = v;

				ui.loadButton.enabled = true;
				ui.saveButton.enabled = true;
				ui.importButton.enabled = true;
				ui.renderButton.enabled = true;
			} else {
				ui.loadButton.enabled = false;
				ui.saveButton.enabled = false;
				ui.importButton.enabled = false;
				ui.renderButton.enabled = false;
			}
		}
	});
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
	}
	// get sequences from selected show's directory .cvs excluding config .cvs
	getSequences = function (showConfig, scope) {
		var showfolder = showConfig['FOLDER']
		scope.showFolder = showfolder;
		var folderpath = scope.showroot + '/' + showfolder + '/' + scope.dbroot
		var folder = new Dir(folderpath);
		var seqlist = folder.entryList('*.csv');
		// exclude config.cvs
		var conffile = seqlist.indexOf('config.csv');
		seqlist.splice(conffile, 1);
		seqlistpath = [];
		// generate paths from data
		for (var i = 0; i < seqlist.length; i++) {
			seqlistpath[i] = folderpath + '/' + seqlist[i];
		}
		return ([seqlistpath, seqlist]);
	}
	// get shots from sequence .cvs
	getShots = function (seqPath, scope) {
		var csvFile = new File(seqPath);
		if (csvFile.exists == true) {
			csvFile.open(1);
			arr = csvFile.read().split('\n');
			var headers = arr[0].split(',');
			arr.shift();
			var data = []
			for (var j = 0; j < arr.length; j++) {
				var obj = {}
				var row = arr[j].split(',');
				for (var k = 0; k < headers.length; k++) {
					obj[headers[k].trim()] = row[k].trim();
				}
				data.push(obj)
			}
			return (data);
		}
	}
	//
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
					node.setTextAttr(w, "MOVIE_PATH", 0, renderFolder + "/" + scope.selSeqName + '/' +scope.selShotName + "/input/" + node.getName(n) + "/" + node.getName(n));
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
	loadShotTBFile = function (m, scope) {
		file = new File(scope.filePath);
		print(scope.filePath);
		file.open(2);
	}
	createShotTBFile = function (m, scope ) {

	}
	saveShotTBFile = function ( m, scope ) {
	}
	backupOpenedFile = function ( m, scope ) {
	}
	//
	// POPULATE LISTS
	//
	populateSequencesList = function (m, scope) {
		selShowConfig = scope.configs[m.data()];
		scope.selShowConfig = selShowConfig;
		seqs = scope.getSequences(selShowConfig, scope);
		scope.selSeqs = seqs;
		slist = seqs[1];
		scope.slistModel.setStringList(slist);
		scope.tv2.setModel(scope.slistModel);
		//
		scope.shotListModel.setStringList([]);
		scope.tv3.setModel(scope.shotListModel);
		scope.shotInfoModel.setStringList([]);
		scope.tv4.setModel(scope.shotInfoModel);
		scope.selShotInfo = [];
	};
	populateShotsList = function (m, scope) {
		var seqPath = scope.selSeqs[0][m.row()];
		scope.selSeqPath = seqPath;
		scope.selSeqName = scope.selSeqs[1][m.row()].replace(/\..+$/, '');
		shots = scope.getShots(seqPath);
		scope.selShots = shots;
		shotNameList = [];
		for (var i in shots) {
			shotNameList.push(shots[i]['NAME']);
		}
		scope.shotListModel.setStringList(shotNameList);
		scope.tv3.setModel(scope.shotListModel);
		//
		scope.shotInfoModel.setStringList([]);
		scope.tv4.setModel(scope.shotInfoModel);
		scope.selShotInfo = [];
	}
	populateShotsInfo = function (m, scope) {
		selShotInfo = scope.selShots[m.row()];
		scope.selShotInfo = selShotInfo;
		scope.info = [];
		for (var i in selShotInfo) {
			scope.info.push(i + "  :  " + selShotInfo[i]);
		}
		scope.selShotName = selShotInfo['NAME'];
		scope.shotInfoModel.setStringList(scope.info);
		scope.tv4.setModel(scope.shotInfoModel);
		if (scope.checkIfTBFileExist(m, scope)) {
			scope.loadButton.text = "Load";
		} else {
			scope.loadButton.text = "Create";
		};
	}
	//
	closeDialog = function () { ui.close() };
	//
	init();
	listModel.setStringList(list);
	tv.setModel(listModel);
	ui.show();
	//
	tvPressed = function (m) { this.populateSequencesList(m, this) };
	tv.pressed.connect(this, tvPressed);
	tvPressed2 = function (m) { this.populateShotsList(m, this) };
	tv2.pressed.connect(this, tvPressed2);
	tvPressed3 = function (m) { this.populateShotsInfo(m, this) };
	tv3.pressed.connect(this, tvPressed3);
	//
	ui.closeButton.pressed.connect(this, closeDialog);
	renderPressed = function (m) { this.createWriteNodes(m, this) };
	ui.renderButton.pressed.connect(this, renderPressed);
	//
	loadPressed = function (m) {
		if (this.checkIfTBFileExist(m, this)) {
			this.loadShotTBFile(m, this);
		} else {
			this.createShotTBFile(m, this);
		}
	}
	ui.loadButton.pressed.connect(this, loadPressed);
}