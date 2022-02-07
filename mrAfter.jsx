// Create an empty dialog window near the upper left of the screen
var dlg = new Window( "palette", "Rudo AE Manager Importer" );
dlg.frameLocation = [ 100, 100 ];
dlg.orientation = 'column';
dlg.alignChildren = "fill";
//
layers = dlg.add('panel', undefined, 'Select Layers...');
layers.orientation = 'row';
//
allLayers = layers.add ("listbox", [10, 15, 205, 350], []);
allLayers.orientation = 'row';
//
btns1 = layers.add('group', undefined, '');
btns1.orientation = 'column';
//
add = btns1.add("button", undefined,' Add');
remove =  btns1.add("button", undefined, 'Remove');
//
renderLayers = layers.add ("listbox", [270, 15, 475, 350], []);
renderLayers.orientation = 'row';
//
btns = dlg.add('panel', undefined, 'Actions...');
btns.orientation = 'column';
//
importBtn = btns.add("button", undefined, 'Import Footage');
composeBtn =  btns.add("button", undefined, 'Create Composition');
//
showrootFolder = new Folder($.getenv("SHOWS"));
//filePath = new File("C:/Users/andi/Dropbox/shows/20210909_virgin_poject/2_PRODUCTION/03_ANIMATION/04_Compo/Dumy/010/current_version/AE_4K/010.aep");
filePath = new File(app.project.file.fsName);
relative = filePath.fsName.replace(showrootFolder.fsName, "");
showroot = $.getenv("SHOWS");
shotData = relative.split('\\');
//
var showName = shotData[1];
var seqName = shotData[5];
var shotName = shotData[6];
var renderFolder = showroot + '/' + showName + '/2_PRODUCTION/03_ANIMATION/04_Compo/'+seqName+'/'+shotName+'/input/';
//
inputFldr = new Folder(renderFolder);//("C:/Users/andi/Dropbox/shows/20210909_virgin_poject/2_PRODUCTION/03_ANIMATION/04_Compo/Dumy/010/input/");
inputItems = inputFldr.getFiles();
for ( var i in inputItems){
    allLayers.add("item", inputItems[i].name);
 }

var selectedLayer

add.onClick = function(){
        selectedLayer = allLayers.selection;
        if(allLayers.selection != null){
            renderLayers.add("item",selectedLayer);
            selectedLayer.enabled = false;
            //allLayers.remove( selectedLayer.index );
        }
}
remove.onClick = function(){
        selectedLayer = renderLayers.selection;
        enableLayer =allLayers.find(selectedLayer).enabled = true;
        renderLayers .remove( selectedLayer.index );
}
importBtn.onClick = function () {
    for (var i = 0; i < renderLayers.items.length; i++){
        var sequencePath = renderFolder+renderLayers.items[i].text+"/";//'~/Desktop/sequence/image_000.png';
        $.writeln (sequencePath);
        var sequenceFolder = new Folder(sequencePath);
        var seqFirstItem = sequenceFolder.getFiles();
        var mySequence = seqFirstItem[0].fsName;
        var importOptions = new ImportOptions();
        importOptions.file = new File(mySequence);
        importOptions.sequence = true;
        importOptions.forceAlphabetical = true;
        importOptions.ImportAs = ImportAsType.COMP;
        var item = app.project.importFile(importOptions);
        $.writeln(item);
    }
}
composeBtn.onClick = function(){
    var sourceList = new Array();
    for (var i = 0; i < renderLayers.items.length; i++){
        var sequencePath = renderFolder+renderLayers.items[i].text+"/";//'~/Desktop/sequence/image_000.png';
        $.writeln (sequencePath);
        var sequenceFolder = new Folder(sequencePath);
        var seqFirstItem = sequenceFolder.getFiles();
        var mySequence = seqFirstItem[0].fsName;
        var importOptions = new ImportOptions();
        importOptions.file = new File(mySequence);
        importOptions.sequence = true;
        importOptions.forceAlphabetical = true;
        //importOptions.ImportAs = ImportAsType.COMP;
        var item = app.project.importFile(importOptions);
        sourceList.push(item);
    } 
    // Generate Compositions
    var sourceFootage = sourceList[0];
    //var compName = sourceFootage.name.substring(0, sourceFootage.name.indexOf(".")) + "_" + i;
    var newComp = app.project.items.addComp(shotName, sourceFootage.width, sourceFootage.height, 1, sourceFootage.duration, sourceFootage.frameRate);
    for (var i = 0; sourceList.length; i++) {
        var sourceFootage = sourceList[i];
        newComp.layers.add(sourceFootage);        
    } 
}
dlg.show();