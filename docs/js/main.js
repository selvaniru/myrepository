/**
 * Author: Harish KV
 * harishkv@ultsglobal.com
 */
var map, toolbar;
var agsConfig;
var graphicsLayerEdgeFlags, graphicsLayerJunctionFlags;
var graphicsLayerEdgeBarriers, graphicsLayerJunctionBarriers;
var graphicsLayerTraceNetworkJunctions, graphicsLayerTraceNetworkEdges;
var graphicsLayerFlagsNotFound, graphicsLayerBarriersNotFound;
var currentTypeGraphic;
var loading;
var traceSolverType1;
var flowMethod;
var flowElements ;
var edgeFlags;
var junctionFlags;
var edgeBarriers;
var junctionBarriers;
var outFields;
var maxTracedFeatures;
var tolerance;
var traceIndeterminateFlow;
var shortestPathObjFn;
var modal;
var modalContent;
var template;
var objectIdList ;
var layerextent;
var sumElement ;
var sumElement1;
var sumElement2;
var n1,n2,n3,n4,n5,n6,n7,n8,n9,n10,n11;
require(["esri/identity/IdentityManager",
"esri/identity/OAuthInfo","esri/request","esri/widgets/Popup",
"esri/PopupTemplate","esri/Map", "esri/views/MapView","esri/layers/MapImageLayer","esri/layers/GraphicsLayer","esri/geometry/projection","esri/Graphic","esri/renderers/SimpleRenderer",
"esri/symbols/SimpleMarkerSymbol","esri/symbols/SimpleLineSymbol", "esri/geometry/Polyline","esri/widgets/LayerList","esri/widgets/Legend","esri/widgets/Expand","esri/geometry/Point","esri/views/draw/Draw",
"esri/rest/networks/trace", "esri/geometry/Extent","esri/geometry/SpatialReference","esri/geometry/support/webMercatorUtils",
"dijit/form/Button","dijit/form/DropDownButton","dijit/Menu","dijit/MenuItem","dijit/Tooltip","dijit/form/Select",'dojo/dom',
'dojo/_base/lang',"dojo/_base/connect","dojo/on","dojo/json","dojo/domReady!"], 
(esriId, OAuthInfo,esriRequest,Popup,PopupTemplate,Map, MapView,MapImageLayer,GraphicsLayer,projection,Graphic,SimpleRenderer,SimpleMarkerSymbol,SimpleLineSymbol,Polyline,
    LayerList,Legend,Expand,Point,Draw,trace,Extent,SpatialReference,webMercatorUtils,Button,DropDownButton,Menu,MenuItem,Tooltip,Select,dom,lang,connect,on,json) => {
  
    document.getElementById("loaderContainer").classList.add("esri-hidden");

    agsConfig = new studioat.js.gnUtility.ags(config);
    
   

    //graphiclayers
    graphicsLayerTraceNetworkEdges= new GraphicsLayer({ title:  "Edges"});
    
    graphicsLayerEdgeFlags= new GraphicsLayer({ title: "EdgeFlags ",listMode : "hide"});
      
    graphicsLayerTraceNetworkJunctions = new GraphicsLayer({ title:  "Junctions"});
    graphicsLayerJunctionFlags= new GraphicsLayer({ title:  "JunctionFlags ",listMode : "hide"});
    
    graphicsLayerEdgeBarriers = new GraphicsLayer({ title:  "EdgeBarriers",listMode : "hide"});
    graphicsLayerJunctionBarriers = new GraphicsLayer({ title:  "JunctionBarriers",listMode : "hide"});
    
    graphicsLayerFlagsNotFound = new GraphicsLayer({ title:  "FlagsNotFound",listMode : "hide"});
    graphicsLayerBarriersNotFound = new GraphicsLayer({ title:  "BarriersNotFound",listMode : "hide"});
     /*
    const clientId = 'f0QsBAWHj4wMFfcf';
    const redirectUri = 'http://192.168.5.217:5500/Tracing/sharing/rest/oauth2/authorize';
    const signInButton = document.getElementById('signInBtn');
    // do this on a button click to avoid popup blockers
    signInButton.addEventListener('click', function(){
        window.open('https://www.arcgis.com/sharing/rest/oauth2/authorize?client_id='+clientId+'&response_type=token&expiration=20160&redirect_uri=' + window.encodeURIComponent(redirectUri), 'oauth-window', 'height=400,width=600,menubar=no,location=yes,resizable=yes,scrollbars=yes,status=yes')
    });
*/

    const map = new Map({
      basemap: "streets-vector",
       container: "map"
    
    });
      
    const view = new MapView({
        container: "map",
        map: map,
        center: [76.22529, 10.527345],
        zoom: 13
     
    });

          
          layerextent = {
            xmin: 630164.3776000002,
            ymin: 1160921.6926000006,
            xmax: 636121.3792000003,
            ymax: 1165547.8628000002,
            spatialReference: {
              latestWkid: 32643
            }};    
        
         
          var layer = new MapImageLayer({
              url:(agsConfig.urlMapServer(agsConfig.operationalLayers.GNLayer))
          });
          var dronelayer = new MapImageLayer({
            url:"https://waternet.ulgis.com/server/rest/services/Trial/DroneImage/MapServer",
            listMode : "hide"});
            map.add(dronelayer);
          map.add(layer);
        
        
  

   
    //graphicsLayerTraceNetworkEdges.popupTemplate = template;
    map.addMany([graphicsLayerTraceNetworkEdges,graphicsLayerTraceNetworkJunctions, graphicsLayerEdgeFlags, graphicsLayerJunctionFlags,  graphicsLayerEdgeBarriers,
          graphicsLayerJunctionBarriers ,graphicsLayerFlagsNotFound, graphicsLayerBarriersNotFound]);
       
          
    let layerList = new LayerList({
        container: document.createElement("div"),
        view: view
      });
      layerListExpand = new Expand({
        expandIcon: "layers",  
        view: view,
        content: layerList
      });
      
    
      view.ui.add(layerListExpand, "top-left");
      view.ui.add(document.getElementById("customAlert"),"top-right");


    const draw = new Draw(
      {view:view});
 

     // Get the button elements
    var btnAddEdge = document.getElementById('btnAddEdge');
    var btnAddJunction = document.getElementById('btnAddJunction');
    var btnBarrierEdge = document.getElementById('btnBarrierEdge');
    var btnBarrierJunction = document.getElementById('btnBarrierJunction');
    var Solve1 = document.getElementById('btnSolve1');
    // Assign onclick functions
    btnAddEdge.onclick = function() {
        setDrawAction('flagEdge', 'square', '#1fd655');
    };

    btnAddJunction.onclick = function() {
        setDrawAction('flagJunction', 'square', '#1fd655');
    };

    btnBarrierEdge.onclick = function() {
        setDrawAction('barrierEdge', 'x', 'red');
    };

    btnBarrierJunction.onclick = function() {
        setDrawAction('barrierJunction', 'x', 'red');
    };

    Solve1.onclick = function() {
      operationTraceNetwork();
  };




    function setDrawAction(currentTypeGraphic,style1,color1) {
      let action = draw.create("point");
      action.on("draw-complete", function (evt) {
        createPointGraphic(evt.coordinates,currentTypeGraphic,style1,color1,true);
      });
    }
  
    function createPointGraphic(coordinates,currentTypeGraphic,style1,color1) {
      let clickedPoint = {
        type: "point",
        x: coordinates[0],
        y: coordinates[1],
        spatialReference :view.spatialReference
      }
        const newExtent = layerextent;
        projection.load().then(function() {
          let outSpatialReference = new SpatialReference({
            wkid: 32643 
          });
          const projectedPoint =projection.project(clickedPoint, outSpatialReference );
          if (projectedPoint.x >= newExtent.xmin &&
            projectedPoint.x <= newExtent.xmax &&
            projectedPoint.y >= newExtent.ymin &&
            projectedPoint.y <= newExtent.ymax) {
           
            let graphicpt = new Graphic({
              geometry: projectedPoint,
              symbol: {
              type: "simple-marker",
              style: style1,
              color: color1,
              size: "12px",
              outline: { 
              color: color1,
              width: 1
              }
              }
            });
            // Add the graphic to the map
            if (currentTypeGraphic == 'flagEdge') {
              graphicsLayerEdgeFlags.add(graphicpt);
            }
            else if (currentTypeGraphic == 'flagJunction') {
              graphicsLayerJunctionFlags.add(graphicpt);
            }
            else if (currentTypeGraphic == 'barrierEdge') {
              graphicsLayerEdgeBarriers.add(graphicpt);
            }
            else if (currentTypeGraphic == 'barrierJunction') {
              graphicsLayerJunctionBarriers.add(graphicpt);
            }

            // Display the coordinates and spatial reference
            console.log("X Coordinate: " + projectedPoint.x);
            console.log("Y Coordinate: " + projectedPoint.y);
            console.log("Spatial Reference: " + JSON.stringify(outSpatialReference ));
            }
          else {
            console.log("The clicked point is outside the specified extent.");
          }
        });
    }
    

    var tooldiv=document.getElementById("btnsdiv");
    var method_flw=tooldiv.dataset.methodflw;
   
    // new Button({
    //     showLabel:false,
    //     id:"btnAddEdge",
    //     iconClass:"addEdge",
    //     onClick:function(){
    //       setDrawAction('flagEdge','square','#1fd655');
    //     }
    // }, "btnAddEdge");
    
    // new Button({
    //     showLabel:false,
    //     id:"btnAddJunction",
    //     iconClass:"addJunction",
    //     onClick:function(){
    //       setDrawAction('flagJunction','square','#1fd655');
    //     }
    // }, "btnAddJunction");

    //  new Button({
    //     showLabel:false,
    //     id:"btnBarrierJunction",
    //     iconClass:"barrierJunction",
    //     onClick:function(){
    //       setDrawAction('barrierJunction','x','red');
    //     }
    // }, "btnBarrierJunction");

    // new Button({
    //     showLabel:false,
    //     id:"btnBarrierEdge",
    //     iconClass:"barrierEdge",
    //     onClick:function(){
    //       setDrawAction('barrierEdge','x','red');
    //     }
    // }, "btnBarrierEdge");

    // new Button({
    //     showLabel:false,
    //     id:"btnSolve",
    //     iconClass:"solve",
    //     onClick:operationTraceNetwork
    // }, "btnSolve");

   
    
  //   var dwnbtn=new Button({
  //     // showLabel:false,
  //     id:"btnDwn",
      
  //     // value:"",
  //     iconClass:"dwntrc",
  //     onClick:function() {
  //       // Change the value when the button is clicked
  //       if (method_flw === "esriFMDownstream") {
  //         tooldiv.dataset.methodflw="";
  //         console.log(tooldiv.dataset.methodflw)
    
  //   }
  //       else{

  //         console.log(tooldiv.dataset.methodflw,"before");
  //         tooldiv.dataset.methodflw="esriFMDownstream";
  //         console.log(tooldiv.dataset.methodflw, "after");
  //       }
  //     }
  // }, 
  var buttonNode = document.getElementById("btnDwn");
buttonNode.addEventListener("click", function () {
    // Change the value when the button is clicked
    if (method_flw === "esriFMDownstream") {
        tooldiv.dataset.methodflw = "";
        console.log(tooldiv.dataset.methodflw);
    } else {
        console.log(tooldiv.dataset.methodflw, "before");
        tooldiv.dataset.methodflw = "esriFMDownstream";
        console.log(tooldiv.dataset.methodflw, "after");
    }
});


  

//   var upbtn=new Button({
//     // showLabel:false,
//     id:"btnUps",
//     // value:"",
//     iconClass:"uptrc",
//     onClick:function() {
//      // Change the value when the button is clicked
//      if (method_flw === "esriFMUpstream") {
//       tooldiv.dataset.methodflw="";
//       console.log(tooldiv.dataset.methodflw)

// }
//     else{

//       console.log(tooldiv.dataset.methodflw,"before");
//       tooldiv.dataset.methodflw="esriFMUpstream";
//       console.log(tooldiv.dataset.methodflw, "after");
//     }
     
//     }
// }, "btnUps");


var buttonNode1 = document.getElementById("btnUps");
buttonNode1.addEventListener("click", function () {
  if (method_flw === "esriFMUpstream") {
    tooldiv.dataset.methodflw="";
    console.log(tooldiv.dataset.methodflw)

}
  else{

    console.log(tooldiv.dataset.methodflw,"before");
    tooldiv.dataset.methodflw="esriFMUpstream";
    console.log(tooldiv.dataset.methodflw, "after");
  }
   
});


//     // showLabel:false,
//     id:"btnCon",
//     // value:"",
//     iconClass:"conctd",
//     onClick:function() {
//      // Change the value when the button is clicked
//      if (method_flw === "esriFMConnected") {
//       tooldiv.dataset.methodflw="";
//       console.log(tooldiv.dataset.methodflw)

// }
//     else{

//       console.log(tooldiv.dataset.methodflw,"before");
//       tooldiv.dataset.methodflw="esriFMConnected";
//       console.log(tooldiv.dataset.methodflw, "after");
//     }
     
//     }
// }, "btnCon")
var buttonNode2 = document.getElementById("btnUps");
buttonNode2.addEventListener("click", function () {
  if (method_flw === "esriFMConnected") {
    tooldiv.dataset.methodflw="";
    console.log(tooldiv.dataset.methodflw)

}
  else{

    console.log(tooldiv.dataset.methodflw,"before");
    tooldiv.dataset.methodflw="esriFMConnected";
    console.log(tooldiv.dataset.methodflw, "after");
  }
   
});


    // ##############################################################################################

    
    // var traceSolverType = new Select({
    //     name:"traceSolverType",
    //     options:[
    //         {
    //             value:"FindAccumulation",
    //             label:"Find Accumulation"
    //         },
    //         {
    //             value:"FindCircuits",
    //             label:"Find Circuits"
    //         },
    //         {
    //             value:"FindCommonAncestors",
    //             label:"Find Common Ancestors"
    //         },
    //         {
    //             value:"FindFlowElements",
    //             label:"Find Flow Elements",
    //             selected:true
    //         },
    //         {
    //             value:"FindFlowEndElements",
    //             label:"Find Flow End Elements"
    //         },
    //         {
    //             value:"FindFlowUnreachedElements",
    //             label:"Find Flow Unreached Elements"
    //         },
    //         {
    //             value:"FindPath",
    //             label:"Find Path"
    //         },
    //         {
    //             value:"FindSource",
    //             label:"Find Source"
    //         },
    //         {
    //             value:"IsolateValve",
    //             label:"Isolate valve"
    //         }
    //     ]
    // }, "traceSolverType");
    // traceSolverType.startup();

 

    // var flowElements = new Select({
    //     name:"flowElements",
    //     options:[
    //         {
    //             value:"esriFEJunctions",
    //             label:"Junctions"
    //         },
    //         {
    //             value:"esriFEEdges",
    //             label:"Edges",
    //             selected:true
    //         },
    //         {
    //             value:"esriFEJunctionsAndEdges",
    //             label:"Junctions and Edges"
    //         },
    //         {
    //             value:"esriFENone",
    //             label:"None"
    //         }
    //     ]
    // }, "flowElements");
    // flowElements.startup();

    // S comment end
    // ##############################################################################################

     
    new Tooltip({
        connectId:["btnAddEdge"],
        label:"Add Edge Flag Tool"
    });

    new Tooltip({
        connectId:["btnAddJunction"],
        label:"Add Junction Flag Tool"
    });

    new Tooltip({
        connectId:["btnBarrierEdge"],
        label:"Add Edge Barrier Tool"
    });

    new Tooltip({
        connectId:["btnBarrierJunction"],
        label:"Add Junction Barrier Tool"
    });

    new Tooltip({
        connectId:["btnSolve"],
        label:"Solve"
    });

    new Tooltip({
        connectId:["traceSolverType"],
        label:"Trace task"
    });

    new Tooltip({
        connectId:["btnDwn"],
        label:"Trace Downstream"
    });

    new Tooltip({
      connectId:["btnUps"],
      label:"Trace Upstream"
  });

    new Tooltip({
    connectId:["btnCon"],
    label:"Trace Connected"
  });
 
    new Tooltip({
        connectId:["flowElements"],
        label:"Flow Elements"
    });



    // Get Selected trace task
    var button0 = document.getElementById('traceSolverType');
      var dropdownContent = document.getElementById('drpcnt');;
      var dropdownBtn = document.getElementById("traceSolverType");
      // Add click event listeners to dropdown items
      dropdownContent.addEventListener('click', function (e) {
        // Update the value property of the button with the clicked item's id
        button0.value = e.target.id;
        button0.textContent = e.target.textContent;
         
    
        // Log the updated value to the console
        console.log('Updated trace task button value:', button0.value);
      });

    // Get Selected flow element
      var button1 = document.getElementById('flowElements');
      var dropdownContent1 =document.getElementById('drpcnt1');;

      // Add click event listeners to dropdown items
      dropdownContent1.addEventListener('click', function (e) {
        // Update the value property of the button with the clicked item's id
        button1.value = e.target.id;
        button1.textContent = e.target.textContent;

        // Log the updated value to the console
        console.log('Updated button value:', button1.value);
      });

    // S comment end ##################################################################################################

    modal = document.getElementById("customAlert");
    modalContent = document.querySelector(".modal-content");
 
  //network
   let url = (agsConfig.urlGNUtility(agsConfig.operationalLayers.GNLayer))+"?f=json";
   console.log(url);
   esriRequest(url, {
    callbackParamName:"callback",
    responseType: "json"
    })
    .then(function(response){
      let geoJson = response.data;
      console.log(geoJson);
   
      if (response.data.GeometricNetworks) {
      var geometricNetworksList =  response.data.GeometricNetworks.map(item => ({
        value: item.id,
        label: item.name,
      }));
      var geometricNetworks = new Select({
        name: 'geometricNetworks',
        options: geometricNetworksList,
        onChange: function () {
          var idx = this.get('value') - 1;
          var indexGroupLayer =agsConfig.geometricNetworkGroupLayerIds[idx];
          // Update visible layers based on the selection
          layer.visible([indexGroupLayer]);
          
        },
      }, 'geometricNetworks');
      geometricNetworks.startup();
      console.log(value);
      const geometricNetworksElement = document.getElementById("geometricNetworks");
      geometricNetworksElement.appendChild(geometricNetworks);
    }
    }).catch((err) => {
        document.getElementById('btnSolve').disabled = true;
        /*
        modalContent.innerHTML="<p>List of Geometric Networks -</p>"+err;
        modal.style.display="block";
        setTimeout(function() {
          modal.style.display = "none";
        }, 3000);*/
      });



var objectIdDiv = document.getElementById("box1");
var mapDiv = document.getElementById("map");

document.getElementById("resulthidden").addEventListener("click", function () {
  
  // Toggle the display property
  if (objectIdDiv.style.display === "none") {
      objectIdDiv.style.display = "block";
      mapDiv.style.marginLeft = "200x";
  } else {
      objectIdDiv.style.display = "none";
      mapDiv.style.marginLeft = "0";
  }
});

//result div listing of heading divs and display divs



document.getElementById("Service_Line").addEventListener("click", function () {
var displayServiceLine = document.getElementById("displayServiceLine");
// Toggle the display property
if (displayServiceLine.style.display === "none") {
displayServiceLine.style.display = "block";

} else {
displayServiceLine.style.display = "none";

}
});
document.getElementById("Transmission-Main").addEventListener("click", function () {
var displayTransmission = document.getElementById("displayTransmission");
// Toggle the display property
if (displayTransmission.style.display === "none") {
displayTransmission.style.display = "block";

} else {
displayTransmission.style.display = "none";

}
});
document.getElementById("Distribution-Main").addEventListener("click", function () {
var displayDistribution = document.getElementById("displayDistribution");
// Toggle the display property
if (displayDistribution.style.display === "none") {
displayDistribution.style.display = "block";

} else {
displayDistribution.style.display = "none";

}
});
document.getElementById("Main_Line").addEventListener("click", function () {
var display0 = document.getElementById("display0");
// Toggle the display property
if (display0.style.display === "none") {
display0.style.display = "block";

} else {
display0.style.display = "none";

}
});
document.getElementById("ServiceValve").addEventListener("click", function () {
var displayServiceValve = document.getElementById("displayServiceValve");
// Toggle the display property
if (displayServiceValve.style.display === "none") {
displayServiceValve.style.display = "block";

} else {
displayServiceValve.style.display = "none";

}
});
document.getElementById("ServiceConnection").addEventListener("click", function () {
var displayServiceConnection = document.getElementById("displayServiceConnection");
// Toggle the display property
if (displayServiceConnection.style.display === "none") {
displayServiceConnection.style.display = "block";

} else {
displayServiceConnection.style.display = "none";

}
});

document.getElementById("Pump").addEventListener("click", function () {
var displayPump = document.getElementById("displayPump");
// Toggle the display property
if (displayPump.style.display === "none") {
displayPump.style.display = "block";

} else {
displayPump.style.display = "none";

}
});
document.getElementById("System_Valve").addEventListener("click", function () {
var displaySystem  = document.getElementById("displaySystem");
// Toggle the display property
if (displaySystem.style.display === "none") {
displaySystem.style.display = "block";

} else {
displaySystem.style.display = "none";

}
});
document.getElementById("Storage_Tank").addEventListener("click", function () {
var displayStorage = document.getElementById("displayStorage");
// Toggle the display property
if (displayStorage.style.display === "none") {
displayStorage.style.display = "block";

} else {
displayStorage.style.display = "none";

}
});

document.getElementById("Fittings").addEventListener("click", function () {
var displayFittings = document.getElementById("displayFittings");
// Toggle the display property
if (displayFittings.style.display === "none") {
displayFittings.style.display = "block";

} else {
displayFittings.style.display = "none";

}
});
document.getElementById("Junctions").addEventListener("click", function () {
var displayJunctions = document.getElementById("displayJunctions");
// Toggle the display property
if (displayJunctions.style.display === "none") {
displayJunctions.style.display = "block";

} else {
displayJunctions.style.display = "none";

}

});



    //solvebtnfn
    function operationTraceNetwork() {
        const numEdgeFlags = graphicsLayerEdgeFlags.graphics.length;
        const numJunctionFlags = graphicsLayerJunctionFlags.graphics.length;
  
        traceSolverType1=button0.value;
        console.log(traceSolverType1);


        console.log( button1.value)

        var params = { f:"json"};
        params.outFields = agsConfig.outFields;
        params.maxTracedFeatures = agsConfig.maxTracedFeatures;
        params.tolerance = agsConfig.tolerance;
        params.flowElements= button1.value;
       
        if (numEdgeFlags === 0 && numJunctionFlags === 0) {
            modalContent.innerHTML ="<p>Set at least one flag!</p>";
            modal.style.display="block";
            setTimeout(function() {
              modal.style.display = "none";
            }, 3000);
        } 
        
    
        if (numEdgeFlags > 0) {
          const edgeFlags = graphicsLayerEdgeFlags.graphics.map(g => g.geometry.toJSON());
          params.edgeFlags = JSON.stringify(edgeFlags);
        }
    
        if (numJunctionFlags > 0) {
          const junctionFlags = graphicsLayerJunctionFlags.graphics.map(g => g.geometry.toJSON());
          params.junctionFlags = JSON.stringify(junctionFlags);
        }
    
        if (graphicsLayerEdgeBarriers.graphics.length > 0) {
          const edgeBarriersJson = graphicsLayerEdgeBarriers.graphics.map(g => g.geometry.toJSON());
          params.edgeBarriers = JSON.stringify(edgeBarriersJson);
        }
    
        if (graphicsLayerJunctionBarriers.graphics.length > 0) {
          const junctionBarriersJson = graphicsLayerJunctionBarriers.graphics.map(g => g.geometry.toJSON());
          params.junctionBarriers = JSON.stringify(junctionBarriersJson);
        }
    /*
        if (traceSolverType1 == 'IsolateValve' && document.getElementById("geometricNetworks").valve != agsConfig.geometricNetworkIdForTaskIsolationValve) {
          modalContent.innerHTML = ("valve isolation set for WaterDistribution_Net");
          modal.style.display="block";
          setTimeout(function() {
            modal.style.display = "none";
          }, 3000);
        
          return;
        }*/
    
        if (traceSolverType1== 'IsolateValve') {
          params.stationLayerId = agsConfig.stationLayerId;
          params.valveLayerId = agsConfig.valveLayerId;
          solve('IsolateValve', params);

        } else {
          params.traceIndeterminateFlow = agsConfig.traceIndeterminateFlow;
          params.traceSolverType = traceSolverType1;
          params.flowMethod = tooldiv.dataset.methodflw;
          params.shortestPathObjFn = agsConfig.findPathAndSource;
    
          solve("TraceNetwork", params);
         
        }
    }
   

// S modification start

    // Add event listeners
document.getElementById('clearFlags').addEventListener('click', clearFlags);
document.getElementById('clearBarriers').addEventListener('click', clearBarriers);
document.getElementById('clearResults').addEventListener('click', clearResults);

// Assuming you have a function to handle clearing flags
function clearFlags() {
  // Implement your logic to clear flags
  graphicsLayerEdgeFlags.removeAll();
  graphicsLayerJunctionFlags.removeAll();
  graphicsLayerFlagsNotFound.removeAll();
  console.log('Flags cleared!');
}

// Assuming you have a function to handle clearing barriers
function clearBarriers() {
  // Implement your logic to clear barriers
  graphicsLayerEdgeBarriers.removeAll();
  graphicsLayerJunctionBarriers.removeAll();
  graphicsLayerBarriersNotFound.removeAll();
  console.log('Barriers cleared!');
}

// Assuming you have a function to handle clearing results
function clearResults() {
  // Implement your logic to clear results
  graphicsLayerTraceNetworkJunctions.removeAll();
  graphicsLayerTraceNetworkEdges.removeAll();
  var b1 = document.getElementById("traceSolverType");
  var b2= document.getElementById("flowElements");
  b1.textContent = "Select Trace Task";
  b2.textContent="Select Flow elements";

  console.log('clicked!');
sum_total=0;
  // Clear the content of the HTML elements
  // document.getElementById("objectIdDiv").innerText = "";
  document.getElementById("displayJunctions").innerText = "";
  document.getElementById("sumElement").textContent = "";
  for (var i = 1; i <= 11; i++) {
      document.getElementById("n" + i).textContent = "";
  }
  console.log('Results cleared!');

}


    function solve(traceSolverType, params) {
      document.getElementById("loaderContainer").classList.remove("esri-hidden");
      var sum_Edge=0;
      var sum_Junction=0;
      
      let countTransmission=0;
      let countDistribution=0;
      let countServiceLine=0;
      let count0=0;

      let countfitting = 0;
      let countServiceValve=0;
      let countStorage=0;
      let countServiceConnection=0;
      let countPump=0;
      let countSystem=0;
      let countjunctions=0;

      sumElement = document.createElement("span");
      sumElement.setAttribute("id", "sumElement");
      var resultDiv=document.getElementById("objectIdDiv");

    
      n1=document.createElement("span");
      n1.setAttribute("id", "n1");
      n2=document.createElement("span");
      n2.setAttribute("id", "n2");
      n3=document.createElement("span");
      n3.setAttribute("id", "n3");
      n4=document.createElement("span");
      n4.setAttribute("id", "n4");
      n5=document.createElement("span");
      n5.setAttribute("id", "n5");
      n6=document.createElement("span");
      n6.setAttribute("id", "n6");
      n7=document.createElement("span");
      n7.setAttribute("id", "n7");
      n8=document.createElement("span");
      n8.setAttribute("id", "n8");
      n9=document.createElement("span");
      n9.setAttribute("id", "n9");
      n10=document.createElement("span");
      n10.setAttribute("id", "n10");
      n11=document.createElement("span");
      n11.setAttribute("id", "n11");


      var tableHTML="" ;
     
    

      var gn= document.getElementById("geometricNetworks").ELEMENT_NODE;
      let url1=(agsConfig.urlGNUtility(agsConfig.operationalLayers.GNLayer, gn /* id layer from soe*/, traceSolverType /*name of operation SOE */));
      esriRequest(url1, {
        query:params,
        callbackParamName:"callback",
        responseType: "json"
        })
        
        .then(function(response){
          //alert(response.message);
          const responseJSON = JSON.stringify(response);
          const result= JSON.parse(responseJSON );
          document.getElementById("downloadbtn").addEventListener("click", function ()
          {
            // Create a Blob from the JSON string
            const blob = new Blob([responseJSON], { type: "application/json" });
       
            // Create a download link
            const downloadLink = document.createElement("a");
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = "response.json";
       
            // Append the link to the document
            document.body.appendChild(downloadLink);
       
            // Trigger a click on the link to start the download
            downloadLink.click();
       
            // Remove the link from the document
            document.body.removeChild(downloadLink);
          })
          
          console.log(result);
          graphicsLayerTraceNetworkJunctions.removeAll();
          graphicsLayerTraceNetworkEdges.removeAll();
          if (result.hasError) {
            modalContent.innerHTML =( "Result:"+result +"Error Solve - description: "+ error);
            modal.style.display="block";
            setTimeout(function() {  
              modal.style.display = "none";
            }, 5000);
          }
          else {
           
            
            var sum_total;
            if ((params.flowElements == 'esriFEEdges') || (params.flowElements == 'esriFEJunctionsAndEdges')) {
                if (result.data.edges) {
                    var resultFeatures = result.data.edges;
                    for (var j = 0, jl = resultFeatures.length; j < jl; j++) {
                        var featureSet = resultFeatures[j].features;
                      
                        sum_Edge+=featureSet.length;
                        for (var i = 0, il = featureSet.length; i < il; i++) {
                          
                            const newExtent = layerextent;
                            var reprojectedPaths = result.data.edges[j].features[i].geometry.paths.map(function(path) {
                              return path.map(function(point) {
                                var reprojectedPoint = projection.project(point, newExtent.spatialReference);
                                return reprojectedPoint;
                              });
                            });
                           
                            var graphic ={
                              geometry: {
                                type: "polyline", 
                                paths:reprojectedPaths,
                                spatialReference: {
                                  wkid: 32643
                                }
                              },
                              symbol:{
                                type: "simple-line", 
                                color: [255,0,0],
                                width: 3
                              },
                              attributes: featureSet[i].attributes,
                              popupTemplate: {
                                title: "ObjectID: {objectid}",content: [
                                  {
                                    type: "fields",
                                    fieldInfos: Object.keys(featureSet[i].attributes).map(key => {
                                      return {
                                        fieldName: key,
                                        label: key
                                      };
                                    })
                                  }
                                ]
                              }
                              
                            };
                           
                            graphicsLayerTraceNetworkEdges.add(graphic);
                           
                            document.getElementById("loaderContainer").style.display = "block";
                            setTimeout(function() {
                            document.getElementById("loaderContainer").style.display = "none";
                            }); 
                          
                            console.log(featureSet[i]);
                            //main-Transmission
                            if (featureSet[i].attributes.assettype=="1")
                            {
                             
                              tableHTML += '<tr><th>Attribute</th><th>Value</th></tr>';

                              for (var key in featureSet[i].attributes) {
                                if (featureSet[i].attributes.hasOwnProperty(key)) {
                                  tableHTML += '<tr><td>' + key + '</td><td>' + featureSet[i].attributes[key] + '</td></tr>';
                                }
                              }

                              // tableHTML += '<tr><td>x</td><td>' + featureSet[i].geometry.paths[x] + '</td></tr>';
                              // tableHTML += '<tr><td>y</td><td>' + featureSet[i].geometry.y + '</td></tr>';
                     
                              displayTransmission.innerHTML+=tableHTML;

                              console.log(featureSet[i].attributes.assettype);
                               countTransmission++;
   
                            }
                            //main-Distribution
                            if (featureSet[i].attributes.assettype=="2")
                            {
                              tableHTML += '<style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #dddddd; text-align: left; padding: 8px; }</style>';
                              tableHTML += '<table>';
                              tableHTML += '<tr><th>Attribute</th><th>Value</th></tr>';

                              for (var key in featureSet[i].attributes) {
                                if (featureSet[i].attributes.hasOwnProperty(key)) {
                                  tableHTML += '<tr><td>' + key + '</td><td>' + featureSet[i].attributes[key] + '</td></tr>';
                                }
                              }

                              // tableHTML += '<tr><td>x</td><td>' + featureSet[i].geometry.x + '</td></tr>';
                              // tableHTML += '<tr><td>y</td><td>' + featureSet[i].geometry.y + '</td></tr>';
                              tableHTML += '</table>';
                              displayDistribution.innerHTML+=tableHTML;
                              console.log(featureSet[i].attributes.assettype);
                              countDistribution++;
                            }
                            //serviceline
                            if (featureSet[i].attributes.assettype=="Service Line"||featureSet[i].attributes.assettype=="6")
                            {
                              tableHTML += '<style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #dddddd; text-align: left; padding: 8px; }</style>';
                              tableHTML += '<table>';
                              tableHTML += '<tr><th>Attribute</th><th>Value</th></tr>';

                              for (var key in featureSet[i].attributes) {
                                if (featureSet[i].attributes.hasOwnProperty(key)) {
                                  tableHTML += '<tr><td>' + key + '</td><td>' + featureSet[i].attributes[key] + '</td></tr>';
                                }
                              }

                              // tableHTML += '<tr><td>x</td><td>' + featureSet[i].geometry.x + '</td></tr>';
                              // tableHTML += '<tr><td>y</td><td>' + featureSet[i].geometry.y + '</td></tr>';
                              tableHTML += '</table>';
                              displayServiceLine.innerHTML+=tableHTML;
                              console.log(featureSet[i].attributes.assettype);
                              countServiceLine++;

                            }
                            //unknown
                            if (featureSet[i].attributes.assettype=="0")
                            {
                              tableHTML += '<style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #dddddd; text-align: left; padding: 8px; }</style>';
                              tableHTML += '<table>';
                              tableHTML += '<tr><th>Attribute</th><th>Value</th></tr>';

                              for (var key in featureSet[i].attributes) {
                                if (featureSet[i].attributes.hasOwnProperty(key)) {
                                  tableHTML += '<tr><td>' + key + '</td><td>' + featureSet[i].attributes[key] + '</td></tr>';
                                }
                              }

                              // tableHTML += '<tr><td>x</td><td>' + featureSet[i].geometry.x + '</td></tr>';
                              // tableHTML += '<tr><td>y</td><td>' + featureSet[i].geometry.y + '</td></tr>';
                              tableHTML += '</table>';
                              display0.innerHTML+=tableHTML;
                              console.log(featureSet[i].attributes.assettype);
                              count0++
                            }
                            console.log("added");
                           
                        }
                        
                    }
                }
            }
            var allFeaturesString=" ";

            if ((params.flowElements == 'esriFEJunctions') || (params.flowElements == 'esriFEJunctionsAndEdges')) {
                if (result.data.junctions) {
                  var resultFeatures =result.data.junctions;
                
                  for (var j = 0, jl = resultFeatures.length; j < jl; j++) {
                      var featureSet = resultFeatures[j].features;
                      sum_Junction+=featureSet.length;
                      for (var i = 0, il = featureSet.length; i < il; i++) {
                        allFeaturesString += JSON.stringify(featureSet[i]) + '<br>';
                          const newExtent =layerextent;
                          // Reproject each point in the path to WKID: 32643
                          var  reprojectedPoint =projection.project(featureSet[i].geometry,newExtent.spatialReference );
                          var graphic ={
                            geometry: {
                              type: "point",  
                              x:reprojectedPoint.x,
                              y:reprojectedPoint.y,
                              spatialReference: {
                                wkid: 32643
                              }
                            },
                            symbol:{
                             type:"simple-marker",
                              style:"square" , 
                              size: 10, 
                              color: [0, 0, 255], 
                              outline: {
                                color:[0, 0, 255], 
                                width: 1 
                            }
                            },
                            attributes: featureSet[i].attributes,
                            popupTemplate: {
                              title: "ObjectID: {objectid}",content: [
                                {
                                  type: "fields",
                                  fieldInfos: Object.keys(featureSet[i].attributes).map(key => {
                                    return {
                                      fieldName: key,
                                      label: key
                                    };
                                  })
                                }
                              ]
                            }
                          };
                          graphicsLayerTraceNetworkJunctions.add(graphic);
                          //document.getElementById("loaderContainer").classList.remove("esri-hidden");
                          //document.getElementById("loaderContainer").style.display = "block";
                          //setTimeout(function() {
                          //  document.getElementById("loaderContainer").style.display = "none";
                          //},1000); 
                          //var display_junctions=document.getElementById("displayJunctions");
                          //display_junctions.innerHTML= allFeaturesString ;

                          //
                          if (featureSet[i].attributes.assettype=="176")
                            {
                              tableHTML += '<style>';
                              tableHTML += 'table { width: 100%; border-collapse: collapse; }';
                              tableHTML += 'th, td { padding: 8px; border: 1px solid #dddddd; text-align: left; }';
                              tableHTML += 'th { background-color: #f2f2f2; }';
                              tableHTML += '</style>';
                              tableHTML += '<table>';
                              tableHTML += '<tr><th>Attribute</th><th>Value</th></tr>';

                              for (var key in featureSet[i].attributes) {
                                if (featureSet[i].attributes.hasOwnProperty(key)) {
                                  tableHTML += '<tr><td>' + key + '</td><td>' + featureSet[i].attributes[key] + '</td></tr>';
                                }
                              }

                              // tableHTML += '<tr><td>x</td><td>' + featureSet[i].geometry.x + '</td></tr>';
                              // tableHTML += '<tr><td>y</td><td>' + featureSet[i].geometry.y + '</td></tr>';
                              tableHTML += '</table>';
                              displayServiceValve.innerHTML+=tableHTML;
                              console.log(featureSet[i].attributes.assettype);
                              countServiceValve++;
     
                            } 
                         
                            if (featureSet[i].attributes.assettype=="1"|| featureSet[i].attributes.assettype=="2"
                            ||featureSet[i].attributes.assettype=="3"||featureSet[i].attributes.assettype=="4"||featureSet[i].attributes.assettype=="5")
                            {
                              tableHTML += '<style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #dddddd; text-align: left; padding: 8px; }</style>';
                              tableHTML += '<table>';
                              tableHTML += '<tr><th>Attribute</th><th>Value</th></tr>';

                              for (var key in featureSet[i].attributes) {
                                if (featureSet[i].attributes.hasOwnProperty(key)) {
                                  tableHTML += '<tr><td>' + key + '</td><td>' + featureSet[i].attributes[key] + '</td></tr>';
                                }
                              }

                              // tableHTML += '<tr><td>x</td><td>' + featureSet[i].geometry.x + '</td></tr>';
                              // tableHTML += '<tr><td>y</td><td>' + featureSet[i].geometry.y + '</td></tr>';
                              tableHTML += '</table>';
                              displayServiceConnection.innerHTML+=tableHTML;
                              console.log(featureSet[i].attributes.assettype);
                              countServiceConnection++;
                              
                            }
                            if  (featureSet[i].attributes.assettype=="281"||featureSet[i].attributes.assettype=="282"||featureSet[i].attributes.assettype=="283")
                            {
                              tableHTML += '<style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #dddddd; text-align: left; padding: 8px; }</style>';
                              tableHTML += '<table>';
                              tableHTML += '<tr><th>Attribute</th><th>Value</th></tr>';

                              for (var key in featureSet[i].attributes) {
                                if (featureSet[i].attributes.hasOwnProperty(key)) {
                                  tableHTML += '<tr><td>' + key + '</td><td>' + featureSet[i].attributes[key] + '</td></tr>';
                                }
                              }

                              // tableHTML += '<tr><td>x</td><td>' + featureSet[i].geometry.x + '</td></tr>';
                              // tableHTML += '<tr><td>y</td><td>' + featureSet[i].geometry.y + '</td></tr>';
                              tableHTML += '</table>';
                              displayPump.innerHTML+=tableHTML;
                              console.log(featureSet[i].attributes.assettype);
                              countPump++;
                           
                            }
                            if (featureSet[i].attributes.assettype=="167"||featureSet[i].attributes.assettype=="169"||
                            featureSet[i].attributes.assettype=="170"||featureSet[i].attributes.assettype=="172" ||featureSet[i].attributes.assettype=="175")
                            {
                              tableHTML += '<style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #dddddd; text-align: left; padding: 8px; }</style>';
                              tableHTML += '<table>';
                              tableHTML += '<tr><th>Attribute</th><th>Value</th></tr>';

                              for (var key in featureSet[i].attributes) {
                                if (featureSet[i].attributes.hasOwnProperty(key)) {
                                  tableHTML += '<tr><td>' + key + '</td><td>' + featureSet[i].attributes[key] + '</td></tr>';
                                }
                              }

                              // tableHTML += '<tr><td>x</td><td>' + featureSet[i].geometry.x + '</td></tr>';
                              // tableHTML += '<tr><td>y</td><td>' + featureSet[i].geometry.y + '</td></tr>';
                              tableHTML += '</table>';
                              displaySystem.innerHTML+=tableHTML;
                              console.log(featureSet[i].attributes.assettype);
                              countSystem++;
                            }
                            if (featureSet[i].attributes.assettype=="561"||featureSet[i].attributes.assettype=="562"||featureSet[i].attributes.assettype=="563"||
                            featureSet[i].attributes.assettype=="564")
                            {
                              tableHTML += '<style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #dddddd; text-align: left; padding: 8px; }</style>';
                              tableHTML += '<table>';
                              tableHTML += '<tr><th>Attribute</th><th>Value</th></tr>';

                              for (var key in featureSet[i].attributes) {
                                if (featureSet[i].attributes.hasOwnProperty(key)) {
                                  tableHTML += '<tr><td>' + key + '</td><td>' + featureSet[i].attributes[key] + '</td></tr>';
                                }
                              }

                              // tableHTML += '<tr><td>x</td><td>' + featureSet[i].geometry.x + '</td></tr>';
                              // tableHTML += '<tr><td>y</td><td>' + featureSet[i].geometry.y + '</td></tr>';
                              tableHTML += '</table>';
                              displayStorage.innerHTML+= tableHTML;
                              console.log(featureSet[i].attributes.assettype);
                              countStorage++; 
                            }

                          
                            if (featureSet[i].attributes.assettype>="41"&&featureSet[i].attributes.assettype<="60")
                            {
                              tableHTML += '<style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #dddddd; text-align: left; padding: 8px; }</style>';
                              tableHTML += '<table>';
                              tableHTML += '<tr><th>Attribute</th><th>Value</th></tr>';

                              for (var key in featureSet[i].attributes) {
                                if (featureSet[i].attributes.hasOwnProperty(key)) {
                                  tableHTML += '<tr><td>' + key + '</td><td>' + featureSet[i].attributes[key] + '</td></tr>';
                                }
                              }

                              // tableHTML += '<tr><td>x</td><td>' + featureSet[i].geometry.x + '</td></tr>';
                              // tableHTML += '<tr><td>y</td><td>' + featureSet[i].geometry.y + '</td></tr>';
                              tableHTML += '</table>';
                              
                              displayFittings.innerHTML+= tableHTML;
                              console.log(featureSet[i].attributes.assettype);
                              countfitting++
                              
                            }
                            //unknown
                            if (featureSet[i].attributes.assettype==0|| featureSet[i].attributes.assettype==null)
                            {
                             
                        
                            tableHTML += '<tr><th>Attribute</th><th>Value</th></tr>';

                            for (var key in featureSet[i].attributes) {
                              if (featureSet[i].attributes.hasOwnProperty(key)) {
                                tableHTML += '<tr><td>' + key + '</td><td>' + featureSet[i].attributes[key] + '</td></tr>';
                              }
                            }

                            // tableHTML += '<tr><td>x</td><td>' + featureSet[i].geometry.x + '</td></tr>';
                            // tableHTML += '<tr><td>y</td><td>' + featureSet[i].geometry.y + '</td></tr>';
                   
                            displayTransmission.innerHTML+=tableHTML;

                            console.log(featureSet[i].attributes.assettype);

                              
                            document.getElementById('displayJunctions').innerHTML += tableHTML;
                            
                                                         
                            countjunctions++
                              
                            }

                          console.log("added"); 
                      }
                  }
                }
            }
            //total count
            sum_total= sum_Edge + sum_Junction;
            sumElement.textContent = ": (" + sum_total +")";
            resultDiv.appendChild(sumElement);
            //edges count
            n1.textContent = ": (" +  countTransmission++ +")";
            n2.textContent = ": (" +countDistribution +")";
            n3.textContent = ": (" +  countServiceLine +")";
            n4.textContent = ": (" + count0 +")";
            
            //junctions count
           
            n5.textContent = ": (" +  countServiceValve+")";
           
            n6.textContent = ": (" +countServiceConnection  +")";
           
            n7.textContent = ": (" + countPump +")";
            n8.textContent = ": (" + countSystem +")";
            n9.textContent = ": (" +  countStorage +")";
            n10.textContent = ": (" + countfitting +")";
            n11.textContent=": (" + countjunctions +")";
            
           
            document.getElementById("Transmission-Main").appendChild(n1);
            document.getElementById("Distribution-Main").appendChild(n2);
            document.getElementById("Service_Line").appendChild(n3);
            document.getElementById("Main_Line").appendChild(n4);
            document.getElementById("ServiceValve").appendChild(n5);
            document.getElementById("ServiceConnection").appendChild(n6);
            document.getElementById("Pump").appendChild(n7);
            document.getElementById("System_Valve").appendChild(n8);
            document.getElementById("Storage_Tank").appendChild(n9);
            document.getElementById("Fittings").appendChild(n10);
            document.getElementById("Junctions").appendChild(n11);

           


            if (result.totalCost) {
              modal.innerHTML =("Total cost:\n" + result.totalCost +message);
              modal.style.display="block";
            setTimeout(function() {
              modal.style.display = "none";
            }, 5000);
            }

            if (result.segmentCosts) {
                modalContent.innerHTML =("Number segment costs:\n" +result.segmentCosts.join('\n') + message);
                modal.style.display="block";
            setTimeout(function() {
              modal.style.display = "none";
            }, 5000);
            }
            modalContent.innerHTML = "<p>Success!</p>";
            modal.style.display="block";
            setTimeout(function() {
              modal.style.display = "none";
            }, 5000);
          } 
          if (result.flagsNotFound && result.flagsNotFound.length > 0) {
            var flagsNotFound = result.flagsNotFound;
            for (var i = 0, il = flagsNotFound.length; i < il; i++) {
              var graphic = new Graphic(new Point(flagsNotFound[i]));
              graphicsLayerFlagsNotFound.add(graphic);
            }
            modalContent.innerHTML =("Flags not found: " + flagsNotFound.length, "warning");
            modal.style.display="block";
            setTimeout(function() {
              modal.style.display = "none";
            }, 5000);
          }

          if (result.barriersNotFound && result.barriersNotFound.length > 0) {
            var barriersNotFound = result.barriersNotFound;
            for (var i = 0, il = barriersNotFound.length; i < il; i++) {
              var graphic = new Graphic(new Point(barriersNotFound[i]));
              graphicsLayerBarriersNotFound.add(graphic);
            } 
            modalContent.innerHTML =("Warning-Barriers not found: " + barriersNotFound.length); 
            modal.style.display="block";
            setTimeout(function() {
              modal.style.display = "none";
            }, 5000);
          }
        }).catch((error) => {
          modalContent.innerHTML =("Error- "+error.message);
          modal.style.display="block";
            setTimeout(function() {
              modal.style.display = "none";
            }, 5000);
          console.log(error);
        })
      
        console.log("done");
       
  
    } 

});

   

    
 
    
      
      
    
    


    
    

