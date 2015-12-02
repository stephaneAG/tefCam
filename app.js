/**
 * Grabs the camera feed from the browser, requesting
 * video from the selected device. Requires the permissions
 * for videoCapture to be set in the manifest.
 *
 * @see http://developer.chrome.com/apps/manifest.html#permissions
 */

var curStream = null; // keep track of current stream

function getCamera() {
  var cameraSrcId = document.querySelector('select').value;

  // constraints allow us to select a specific video source 
  var constraints = {
    video: {
      optional: [{
        sourceId: cameraSrcId
      }]
    },
    audio:false
  }

  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia

  navigator.getUserMedia(constraints, function(stream) {
    var videoElm = document.querySelector('video');
    videoElm.src = URL.createObjectURL(stream);

    stream.onended = function() {
      updateButtonState();
    }

    videoElm.onplay = function() {
      if(curStream !== null) {
        // stop previous stream
        curStream.stop();
      }

      curStream = stream;
      updateButtonState();  
    }
  }, function(e) {
    curStream = null;
    console.error(e);
  });
}

/**
 * Click handler to init the camera grab
 */
document.querySelector('button').addEventListener('click', function(e) {
  // camera is active, stop stream
  if(curStream && curStream.active) {
    curStream.stop();
    document.querySelector('video').src = "";
  }
  else {
    getCamera();
  }

});

/**
 * Change stream source according to dropdown selection
 */
document.querySelector('select').addEventListener('change',function() {
  if(curStream && curStream.active) {
    getCamera();
  }
});

/**
 * Updates button state according to Camera stream status
 */

function updateButtonState() {
  var btn = document.querySelector('button');
  btn.disabled = false;

  if((!curStream) || (!curStream.active)) {
    btn.innerHTML = "Enable Camera";
  }
  else {
    btn.innerHTML = "Disable Camera"; 
  }
}

/**
 * Populate camera sources drop down
 */

getVideoSources(function(cameras){
  var ddl = document.querySelector('select');
  if(cameras.length == 1) {
    // if only 1 camera is found drop down can be disabled
    ddl.disabled = true;
  }

  cameras.forEach(function(camera){
    var opt = document.createElement('option');
    opt.value = camera.id;
    opt.appendChild(document.createTextNode(camera.label));

    ddl.appendChild(opt);
  });   
}); 

/**
 * This retrieves video sources and passes them to callback parameter
 */

function getVideoSources(callback) {
  var videoSources = [];
  callback = callback || function(){};

  MediaStreamTrack.getSources(function(sources){
    sources.forEach(function(source,index){
      if(source.kind === 'video') {
        // we only need to enlist video sources
        videoSources.push({
          id: source.id,
          label: source.label || 'Camera '+(videoSources.length+1)
        });  
      }
    });

    callback(videoSources);
  });
}



/* == TEF EDIT/ADD == */

/**
 * Click handler to create other window - R: we shoudln't get troubles since each window is sandboxes
 */


//document.querySelector('.newWindow').addEventListener('click', function(e) {
document.getElementById('newWindow').addEventListener('click', function(e) {

  // check if we already hve more than one window
  //var currWinId = window.currWinId || 0;
  // increase the current number of windows
  //window.currWinId = currWinId+1;

  // create a new window
  chrome.app.window.create('index.html', { // infinite loop ? ^^ Nb: the click handlers may need mods
    //id: "camCaptureID",
    //id: "tefCamID" + window.currWinId,
    innerBounds: {
      width: 700,
      height: 600
    }
  });

});
