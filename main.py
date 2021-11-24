# This Python file uses the following encoding: utf-8
import os, sys, csv, subprocess #, pipes
from pathlib import Path
from PyQt5.QtMultimediaWidgets import QVideoWidget
from PyQt5.QtWidgets import QApplication, QMainWindow, QDialog, QFileDialog, QLabel
from PyQt5.QtGui import QPixmap
from PyQt5.QtMultimedia import QMediaContent, QMediaPlayer, QMediaPlaylist
from PyQt5 import uic
from PyQt5.QtCore import QFile, QStringListModel, QUrl

class Ui(QMainWindow):
    def __init__(self, ui_path):
        super(Ui, self).__init__() # Call the inherited classes __init__ method
        self.setFocusPolicy(Qt.StrongFocus)
        uic.loadUi(ui_path, self) # Load the .ui file
        #self.QmediaPlayer.resize =(230,230)
        self.mediaPlayer = QMediaPlayer(self)
        self.mediaPlayer.setVideoOutput(self.QmediaPlayer)
        self.QmediaPlayer.hide()
        self.show() # Show the GUI

    def focusInEvent(self,event):
        self.setFocus(True)
        self.activateWindow()
        self.raise_()
        self.show()

class QD(QDialog):

    def __init__(self, ui_path):
        global showroot
        global dbroot
        global messageBox
        super(QD, self).__init__() # Call the inherited classes __init__ method
        uic.loadUi(ui_path, self) # Load the .ui file
        self.rootPath.setText(showroot)
        self.dbRelativePath.setText(dbroot)
        self.buttonBox.accepted.connect( self.ok )
        self.buttonBox.rejected.connect( self.close )
        self.rootBrowseButton.pressed.connect( self.browse )
        self.dbBrowseButton.pressed.connect( self.dbBrowse )
        print(showroot)
            
    def dbBrowse(self):
        global showroot
        global dbroot
        global messageBox
        dlg = QFileDialog()
        dlg.setFileMode(QFileDialog.Directory)
        _selDir = dlg.getExistingDirectory()
        print(showroot, _selDir)
        if (showroot not in _selDir):
            messageBox("DB folder must be inside Show Root Folder!")
        else:
            _selDir = _selDir.replace(showroot,"")
            _parts = _selDir.split("/")
            del _parts[0]
            del _parts[0]
            _dbRelativePath = '/'.join(_parts)
            self.dbRelativePath.setText(_dbRelativePath)

    def browse(self):
        global showroot
        dlg = QFileDialog()
        dlg.setFileMode(QFileDialog.Directory)
        _selDir = dlg.getExistingDirectory()
        showroot = _selDir
        self.rootPath.setText(showroot)

    def ok(self):
        global showroot
        global dbroot
        global populateShowList

        if showroot != self.rootPath.text() or dbroot != self.dbRelativePath.text() :
            if showroot != self.rootPath.text:
                showroot = self.rootPath.text()
                exp = "setx SHOWS %s" % showroot
                subprocess.Popen(exp, shell=True).wait()
            if showroot != self.rootPath.text:
                dbroot = self.dbRelativePath.text()
                exp = "setx DBRP %s" % dbroot
                subprocess.Popen(exp, shell=True).wait()
            populateShowList()

if __name__ == '__main__':
    def showPrefsDialog():
        ui_file_path = os.fspath(Path(__file__).resolve().parent / "RudoManager_prefs.ui")
        qd = QD(ui_file_path)
        qd.exec_()

    def _quit(a):
        sys.exit(app.exec_())

    # get sequences from selected show's directory .cvs excluding config .cvs
    def getSequences(showConfig):
        global showFolder
        showFolder = showConfig['FOLDER']
        folderpath = showroot + '/' + showFolder + '/' + dbroot
        files = os.listdir(folderpath)
        seqlist = files # list(filter(lambda f: f.endswith('.csv'), files))
#        = folder.entryList('*.csv')
        # exclude config.cvs
        conffile = seqlist.index('config.csv')
        seqlist.pop(conffile)
        seqlistpath = []
        # generate paths from data
        for l, m in  enumerate(seqlist):
                seqlistpath.append(folderpath + '/' + seqlist[l])
        return ([seqlistpath, seqlist])


    # get shots from sequence .cvs
    def getShots(seqPath):
            if os.path.isfile(seqPath):
                with open(seqPath) as csv_file:
                    arr = csv.reader(csv_file, delimiter=',')
                    lineCount = 0
                    # separate headers and data
                    data = []
                    arrr = []
                    for row in arr:
                        if lineCount == 0:
                            headers = row
                            lineCount += 1
                        else:
                            arrr.append(row)
                            lineCount += 1
                    for j, l in enumerate(arrr):
                        obj = {}
                        row = arrr[j]
                        for k, m in enumerate(headers):
                                print(k)
                                obj[headers[k]] = row[k]
                        data.append(obj)
                return (data)

    # initialization proccess
    # explore into show root directory
    # dbdir = os.listdir(showroot)
    def populateShowList():
        print(showroot)
        global list
        global config
        global dbroot
        global showPrefsDialog
        list = []
        if showroot and dbroot:
            dir_list = os.listdir(showroot)
        else:
            showPrefsDialog()
            return False

        for i in dir_list:
            # look for config.csv on detected
            try:
                csvPath = showroot + '/' + i + '/' + dbroot + '/' + "config.csv"
                # check file exists
                if os.path.isfile(csvPath) is True:
                    with open(csvPath) as csv_file:
                        csvFile = csv.reader(csv_file, delimiter=',')
                        list.append(i)
                        lineCount = 0
                        # separate headers and data
                        for row in csvFile:
                            if lineCount == 0:
                                headers = row
                                lineCount += 1
                            else:
                                data = row
                                lineCount += 1
                        # csv to obj
                        obj = {}
                        for j,k in enumerate(data):
                            obj[headers[j]] = data[j]

                        # fill 'config' variable
                        configs[i] = obj
                    listModel.setStringList(list)
                    tv.setModel(listModel)
                    shotNotSelected()
                    shotListModel.setStringList([])
                    tv3.setModel(shotListModel)
                    shotInfoModel.setStringList([])
                    tv4.setModel(shotInfoModel)
                    selShotInfo = []
            except:
                print('config.csv at {}', (showroot))


    def populateSequencesList(m):
        global selSeqs
        selShowConfig = configs[m.data()]
        selShowConfig = selShowConfig
        selSeqs = getSequences(selShowConfig)
        slist = selSeqs[1]
        namelist = []
        for i in slist:
            print(i)
            s = i.replace('.csv','')
            namelist.append(s)
        slistModel.setStringList(namelist)
        tv2.setModel(slistModel)
        #
        shotListModel.setStringList([])
        tv3.setModel(shotListModel)
        shotInfoModel.setStringList([])
        tv4.setModel(shotInfoModel)
        selShotInfo = []
        shotNotSelected()


    def populateShotsList(m):
        global selSeqName
        global selSeqs
        global selShots
        seqPath = selSeqs[0][m.row()]
        selSeqPath = seqPath
        selSeqName = os.path.splitext(selSeqs[1][m.row()])[0]
        shots = getShots(seqPath)
        selShots = shots
        shotNameList = []
        for i in shots:
            shotNameList.append(i['NAME'])

        shotListModel.setStringList(shotNameList)
        tv3.setModel(shotListModel)

        shotInfoModel.setStringList([])
        tv4.setModel(shotInfoModel)
        selShotInfo = []
        shotNotSelected()


    def populateShotsInfo(m):
            global selSeqName
            global selSeqs
            global selShots
            global selShotInfo
            global selShotName
            global ui
            if(m is not None):selShotInfo = selShots[m.row()]
            info = []
            for i in selShotInfo:
                    info.append(i + "  :  " + selShotInfo[i])

            selShotName = selShotInfo['NAME']
            shotInfoModel.setStringList(info)
            tv4.setModel(shotInfoModel)
            ui.loadButton_tb.setEnabled(checkIfTBFileExist()[0])
            ui.loadButton_ae.setEnabled(checkIfAEFileExist()[0])
            ui.newButton_tb.setEnabled(True)
            ui.newButton_ae.setEnabled(True)
            ui.tbVersionsCB.clear()
            ui.aeVersionsCB.clear()
            ui.tbVersionsCB.addItems(checkIfTBFileExist()[1])
            ui.aeVersionsCB.addItems(checkIfAEFileExist()[1])
            print(showroot+"/"+showFolder+tbRootPath+"_template")
            print(showroot+"/"+showFolder+aeRootPath+"_template")
            ui.tbTemplatesCB.clear()
            ui.aeTemplatesCB.clear()
            ui.tbTemplatesCB.addItems(os.listdir(showroot+"/"+showFolder+tbRootPath+"_template"))
            ui.aeTemplatesCB.addItems(os.listdir(showroot+"/"+showFolder+aeRootPath+"_template"))

            videoFile = showroot+"/"+showFolder+tbRootPath+selSeqName+"/"+selShotName+"/_preview.mov"
            ui.QmediaPlayer.hide()
            if ( os.path.isfile(videoFile) ):
                playlist = QMediaPlaylist(ui.mediaPlayer)
                url = QUrl.fromLocalFile(videoFile)
                playlist.addMedia(QMediaContent(QUrl(url)))
                playlist.setPlaybackMode(QMediaPlaylist.Loop)
                ui.mediaPlayer.setPlaylist(playlist)
                ui.QmediaPlayer.show()
                ui.mediaPlayer.play()
            
            if (os.path.isfile(showroot+"/"+showFolder+tbRootPath+selSeqName+"/"+selShotName+"/_preview.jpg")):
                ui.previewImgL.setPixmap(QPixmap(showroot+"/"+showFolder+tbRootPath+selSeqName+"/"+selShotName+"/_preview.jpg"))
            else:
                ui.previewImgL.clear()
            
    def shotNotSelected():
        ui.loadButton_tb.setEnabled(False)
        ui.loadButton_ae.setEnabled(False)
        ui.newButton_tb.setEnabled(False)
        ui.newButton_ae.setEnabled(False)
        ui.tbVersionsCB.clear()
        ui.aeVersionsCB.clear()
        ui.tbTemplatesCB.clear()
        ui.aeTemplatesCB.clear()

    def checkIfTBFileExist():
        global showroot
        global showFolder 
        global selSeqName
        global selShotName
        filePath = 	showroot + '/' + showFolder + tbRootPath + selSeqName + '/' + selShotName + '/current_version/' + selShotName + ".xstage";
        olderVersionsDirPath = 	showroot + '/' + showFolder + tbRootPath + selSeqName + '/' + selShotName + '/older_versions/';
        if os.path.isfile(filePath):
            current = ['current_version']
            if os.path.isdir(olderVersionsDirPath):
                versions = os.listdir(olderVersionsDirPath)
                return [True, current+versions]
            else:
                return [True, current]
        else:
            return [False,['Empty']]

    def checkIfAEFileExist():
        global showroot
        global showFolder 
        global selSeqName
        global selShotName
        filePath = 	showroot + '/' + showFolder + tbRootPath + selSeqName + '/' + selShotName + '/current_version/' + selShotName + ".aep";
        olderVersionsDirPath = 	showroot + '/' + showFolder + aeRootPath + selSeqName + '/' + selShotName + '/older_versions/';
        if os.path.isfile(filePath):
            current = ['current_version']
            if os.path.isdir(olderVersionsDirPath):
                versions = os.listdir(olderVersionsDirPath)
                return [True, current+versions]
            else:
                return [True, current]
        else:
            return[False, ['Empty']]

    def tvPressed(m):
        populateSequencesList(m)

    def tvPressed2(m):
        populateShotsList(m)

    def tvPressed3(m):
        populateShotsInfo(m)

    def _logpath(path, names):
        import logging
        logging.info('Working in %s' % path)
        return []   # nothing will be ignored

    def newTBPressed():
        if (checkIfTBFileExist()[0] ):
            from shutil import copytree
            src = showroot + '/' + showFolder + tbRootPath + selSeqName + '/' + selShotName + '/current_version/'
            version = ui.tbVersionsCB.currentText()
            if( version != 'current_version'):
                new_version = str(int(checkIfTBFileExist()[1][-1])+1).zfill(3) # zfill function fills with (n) Zeros and returns a string
            else:
                new_version = '001'
            dst = showroot + '/' + showFolder + tbRootPath + selSeqName + '/' + selShotName + '/older_versions/' + selSeqName + "_" + selShotName + "_" + new_version
            #print(src,dst)
            copytree(src, dst)
            populateShotsInfo(None)
            messageBox('current TB version was backuped as ' + new_version)
        else:
            #copy from template
            src = showroot + '/' + showFolder + '/2_PRODUCTION/03_ANIMATION/02_SEQ/_template'
            if os.path.isdir(src):
                from shutil import copytree
                dst = showroot + '/' + showFolder + tbRootPath + selSeqName + '/' + selShotName + '/current_version/'
                copytree(src, dst)
                messageBox('new TB file was created for '+ selSeqName + '/' + selShotName+" from template")
                for i in  os.listdir(dst):
                    if ( i.find("###") != -1):
                        os.rename(dst+i, dst+i.replace("###",selShotName))                
                populateShotsInfo(None)
            else:
                messageBox('ERROR: _template directory does not exists for Animation')


    def newAEPressed():
        if (checkIfAEFileExist()[0]):
            from shutil import copytree
            src = showroot + '/' + showFolder + aeRootPath + selSeqName + '/' + selShotName + '/current_version/'
            version = ui.tbVersionsCB.currentText()
            if( version != 'current_version'):
                new_version = str(int(checkIfTBFileExist()[1][-1])+1).zfill(3)
            else:
                new_version = '001'
            dst = showroot + '/' + showFolder + aeRootPath + selSeqName + '/' + selShotName + '/older_versions/' + new_version
            copytree(src, dst)
            populateShotsInfo(None)
            messageBox('current AE version was backuped as ' + new_version)
        else:
            #copy from template
            src = showroot + '/' + showFolder + '/2_PRODUCTION/03_ANIMATION/04_Compo/_template'
            if os.path.isdir(src):
                from distutils.dir_util import copy_tree                
                dst = showroot + '/' + showFolder + aeRootPath + selSeqName + '/' + selShotName + '/current_version/'
                copy_tree(src, dst)
                messageBox('new TB file was created for '+ selSeqName + '/' + selShotName+" from template")
                for i in  os.listdir(dst):
                    if ( i.find("###") != -1):
                        os.rename(dst+i, dst+i.replace("###",selShotName))
                populateShotsInfo(None)
            else:
                messageBox('ERROR: _template directory does not exists for Animation')

    def openTBFile():
        version = ui.tbVersionsCB.currentText()
        if( version != 'current_version'):
            filepath = showroot + '/' + showFolder + tbRootPath + selSeqName + '/' + selShotName + '/older_versions/' + selShotName + ".xstage"
        else:
            filepath = showroot + '/' + showFolder + tbRootPath + selSeqName + '/' + selShotName + '/current_version/' + selShotName + ".xstage"
        os.startfile(filepath)

    def openAEFile():
        version = ui.aeVersionsCB.currentText()
        if( version != 'current_version'):
            filepath = showroot + '/' + showFolder + aeRootPath + selSeqName + '/' + selShotName + '/older_versions/' + selShotName + ".aep"
        else:
            filepath = showroot + '/' + showFolder + aeRootPath + selSeqName + '/' + selShotName + '/current_version/' + selShotName + ".aep"
        os.startfile(filepath)

    def messageBox(text):
        from PyQt5.QtWidgets import QMessageBox
        msg = QMessageBox()
        msg.setIcon(QMessageBox.Information)
        msg.setText(text)
        msg.setWindowTitle("Information")
        msg.exec_()
    # Some code to obtain the form file name, ui_file_name
    app = QApplication(sys.argv)
    ui_file_path = os.fspath(Path(__file__).resolve().parent / "RudoManager_mw.ui")
    ui = Ui(ui_file_path)

    #   create links to ui widgets
    tv = ui.listView
    tv2 = ui.listView_2
    tv3 = ui.listView_3
    tv4 = ui.listView_4
    loadButton_tb = ui.loadButton_tb
    loadButton_ae = ui.loadButton_ae
    newTBButton = ui.newButton_tb
    newAEButton = ui.newButton_ae
    #
    #
    tbRootPath = '/2_PRODUCTION/03_ANIMATION/02_SEQ/'
    aeRootPath = '/2_PRODUCTION/03_ANIMATION/04_Compo/'

    # mrRudoManager starts here.
    # set SHOWs folder from environment variable -> os.getenv('FOO')
    showroot = os.getenv("SHOWS")
    print(showroot)
    # pipeline config.csv location
    dbroot = os.getenv("DBRP")
    if (dbroot == None):
        dbroot = '2_PRODUCTION/05_DB'
    print(dbroot)
    # create scope variables for widget using
    configs = {}
    list = []
    slist = []
    selShots = []
    info = []
    selSeqs = []
    selSeqName = ""
    filePath = ""
    showFolder = ""

    # QList Model creation
    listModel = QStringListModel()
    slistModel = QStringListModel()
    shotListModel = QStringListModel()
    shotInfoModel = QStringListModel()

    # init 'Selected Shot Info' var
    selShotInfo = ""
    selShotName = ""

    from darktheme.widget_template import DarkPalette
    app.setStyle("Fusion")
    app.setPalette(DarkPalette())
    app.setStyleSheet("QToolTip { color: #000; background-color: grey; border: 1px solid white; }")
    app.setStyle("Fusion")
    tv3.pressed.connect(tvPressed3)
    tv2.pressed.connect(tvPressed2)
    tv.pressed.connect(tvPressed)
    newTBButton.pressed.connect(newTBPressed)
    newAEButton.pressed.connect(newAEPressed)
    loadButton_tb.pressed.connect(openTBFile)
    loadButton_ae.pressed.connect(openAEFile)

    ui.prefButton.clicked.connect(showPrefsDialog)
    populateShowList()
    sys.exit(app.exec_())
