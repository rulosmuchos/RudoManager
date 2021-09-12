# RudoManager
Animation Studio Pipeline Tool
RM is a version tracker, version generator, pipeline CVS reader
##### RM lets you visualize a Show/Sequence/Shot/Step/Version Structure (SSSSV)
##### RM launches Animation ( Toon Boom ) or Composition ( After Effects ) specific files.
##### RM creates SSSSV files from a template

## Instructions:
1. first time? Pref Dialog appears > locate the show root folder path
2. Configure DB root relative path.
3. every show must have a config.cvs at the 'db root relative path'
eg = 
SHOW,FOLDER,ACTIVE,CLIENT,FPS,FORMAT,COLORSPACE,RENDER
ttk,20210909_virgin_poject,YES,ORCOVIDEOS,25,3840x2160,ACES2065-1,$SEQ/$SHOT/o_$SHOW_$SEQ_$SHOT/o_$SHOW_$SEQ_$SHOT.####.exr
4. every show must have a .cvs for each Show's Sequence, declaring the shots included. 
eg = Crying.cvs 
ID,THUMBNAIL,NAME,VENDOR,COMP,STATUS,FRAME RANGE
10101,,010,LAP,FEQU,APP, *
10102,,020,LAP,FEQU,APP,
10103,,030,LAP,FEQU,APP,
10104,,040,LAP,FEQU,APP,
10105,,050,LAP,FEQU,APP,
10106,,060,LAP,FEQU,APP,
10107,,070,LAP,FEQU,APP,
10108,,080,LAP,FEQU,APP,
10109,,090,LAP,FEQU,APP,
10110,,100,LAP,FEQU,APP,
10111,,110,LAP,FEQU,APP,
10112,,120,LAP,FEQU,APP,
10113,,130,LAP,FEQU,APP,
10114,,140,LAP,FEQU,APP,

* will create sequence's files at Crying/010
5.Use New button to create step/shots files from a '_template' located at set root
eg= 
shows\20210813_testproyect_2\2_PRODUCTION\03_ANIMATION\02_SEQ\_template
6.Use New Button to create an incremental backup from current_version file
7.Use Load Button to open selected file


#### Requirements : PyQt5, python, pyInstaller
  
