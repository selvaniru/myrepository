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
var flowElements;
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
    //buttons
    new Button({
        showLabel:false,
        id:"btnAddEdge",
        iconClass:"addEdge",
        onClick:function(){
          setDrawAction('flagEdge','square','#1fd655');
        }
    }, "btnAddEdge");
    
    new Button({
        showLabel:false,
        id:"btnAddJunction",
        iconClass:"addJunction",
        onClick:function(){
          setDrawAction('flagJunction','square','#1fd655');
        }
    }, "btnAddJunction");

     new Button({
        showLabel:false,
        id:"btnBarrierJunction",
        iconClass:"barrierJunction",
        onClick:function(){
          setDrawAction('barrierJunction','x','red');
        }
    }, "btnBarrierJunction");

    new Button({
        showLabel:false,
        id:"btnBarrierEdge",
        iconClass:"barrierEdge",
        onClick:function(){
          setDrawAction('barrierEdge','x','red');
        }
    }, "btnBarrierEdge");

    new Button({
        showLabel:false,
        id:"btnSolve",
        iconClass:"solve",
        onClick:operationTraceNetwork
    }, "btnSolve");

   
    
    var dwnbtn=new Button({
      // showLabel:false,
      id:"btnDwn",
      // value:"",
      iconClass:"dwntrc",
      onClick:function() {
        // Change the value when the button is clicked
        if (method_flw === "esriFMDownstream") {
          tooldiv.dataset.methodflw="";
          console.log(tooldiv.dataset.methodflw)
    
    }
        else{

          console.log(tooldiv.dataset.methodflw,"before");
          tooldiv.dataset.methodflw="esriFMDownstream";
          console.log(tooldiv.dataset.methodflw, "after");
        }
      }
  }, "btnDwn");

  var upbtn=new Button({
    // showLabel:false,
    id:"btnUps",
    // value:"",
    iconClass:"uptrc",
    onClick:function() {
     // Change the value when the button is clicked
     if (method_flw === "esriFMUpstream") {
      tooldiv.dataset.methodflw="";
      console.log(tooldiv.dataset.methodflw)

}
    else{

      console.log(tooldiv.dataset.methodflw,"before");
      tooldiv.dataset.methodflw="esriFMUpstream";
      console.log(tooldiv.dataset.methodflw, "after");
    }
     
    }
}, "btnUps");


  var conbtn=new Button({
    // showLabel:false,
    id:"btnCon",
    // value:"",
    iconClass:"conctd",
    onClick:function() {
     // Change the value when the button is clicked
     if (method_flw === "esriFMConnected") {
      tooldiv.dataset.methodflw="";
      console.log(tooldiv.dataset.methodflw)

}
    else{

      console.log(tooldiv.dataset.methodflw,"before");
      tooldiv.dataset.methodflw="esriFMConnected";
      console.log(tooldiv.dataset.methodflw, "after");
    }
     
    }
}, "btnCon");
    
    
    var traceSolverType = new Select({
        name:"traceSolverType",
        options:[
            {
                value:"FindAccumulation",
                label:"Find Accumulation"
            },
            {
                value:"FindCircuits",
                label:"Find Circuits"
            },
            {
                value:"FindCommonAncestors",
                label:"Find Common Ancestors"
            },
            {
                value:"FindFlowElements",
                label:"Find Flow Elements",
                selected:true
            },
            {
                value:"FindFlowEndElements",
                label:"Find Flow End Elements"
            },
            {
                value:"FindFlowUnreachedElements",
                label:"Find Flow Unreached Elements"
            },
            {
                value:"FindPath",
                label:"Find Path"
            },
            {
                value:"FindSource",
                label:"Find Source"
            },
            {
                value:"IsolateValve",
                label:"Isolate valve"
            }
        ]
    }, "traceSolverType");
    traceSolverType.startup();

 

    var flowElements = new Select({
        name:"flowElements",
        options:[
            {
                value:"esriFEJunctions",
                label:"Junctions"
            },
            {
                value:"esriFEEdges",
                label:"Edges",
                selected:true
            },
            {
                value:"esriFEJunctionsAndEdges",
                label:"Junctions and Edges"
            },
            {
                value:"esriFENone",
                label:"None"
            }
        ]
    }, "flowElements");
    flowElements.startup();
     
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

    var menuClear = new Menu({
        style: "display: none;"
    });
    
    // Add menu items
    var menuItem1 = new MenuItem({
        label:"Clear Flags",
        onClick:function () {
            graphicsLayerEdgeFlags.removeAll();
            graphicsLayerJunctionFlags.removeAll();
            graphicsLayerFlagsNotFound.removeAll();
        }
    });
    menuClear.addChild(menuItem1);
    
    var menuItem2 = new MenuItem({
        label:"Clear Barriers",
        onClick:function () {
            graphicsLayerEdgeBarriers.removeAll();
            graphicsLayerJunctionBarriers.removeAll();
            graphicsLayerBarriersNotFound.removeAll();
                
        }
    });
    menuClear.addChild(menuItem2);

    var menuItem3 = new MenuItem({
        label:"Clear Results",
        onClick:function () {
            graphicsLayerTraceNetworkJunctions.removeAll();
            graphicsLayerTraceNetworkEdges.removeAll();
            var myDiv1 = document.getElementById("displayEdges");
            var myDiv2= document.getElementById("displayJunctions");
            myDiv1.innerText = " ";
            myDiv2.innerText = " ";
            sumElement.textContent=" ";
            sumElement1.textContent=" ";
            sumElement2.textContent=" ";
          }
          
          
        
    });
    menuClear.addChild(menuItem3);
        
        
    var dropDownButton = new DropDownButton({
        label: "Clear",
        dropDown:menuClear
    });
    dropDownButton.placeAt(document.getElementById("ddbClears"));
    dropDownButton.startup();

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

    document.getElementById("newDiv").addEventListener("click", function () {
        var displayEdges = document.getElementById("displayEdges");
      // Toggle the display property
      if (displayEdges.style.display === "none") {
        displayEdges.style.display = "block";
          
      } else {
        displayEdges.style.display = "none";
          
      }
  });
  document.getElementById("newDiv2").addEventListener("click", function () {
    var displayEdges = document.getElementById("displayJunctions");
  // Toggle the display property
  if (displayEdges.style.display === "none") {
    displayEdges.style.display = "block";
      
  } else {
    displayEdges.style.display = "none";
      
  }
});


    //solvebtnfn
    function operationTraceNetwork() {
        const numEdgeFlags = graphicsLayerEdgeFlags.graphics.length;
        const numJunctionFlags = graphicsLayerJunctionFlags.graphics.length;
  
        traceSolverType1=traceSolverType.get("value");
        console.log(traceSolverType1);

        var params = { f:"json"};
        params.outFields = agsConfig.outFields;
        params.maxTracedFeatures = agsConfig.maxTracedFeatures;
        params.tolerance = agsConfig.tolerance;
        params.flowElements= flowElements.get("value");
       
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
   
   
    function solve(traceSolverType, params) {
      //document.getElementById("loaderContainer").classList.remove("esri-hidden");
      var sum_Edge=0;
      var sum_Junction=0;
      sumElement = document.createElement("span");
      var resultDiv=document.getElementById("objectIdDiv");
      var display_edges=document.getElementById("displayEdges");
      sumElement1=document.createElement("span");
      var count_edges=document.getElementById("newDiv");

      sumElement2=document.createElement("span");
      var count_junction=document.getElementById("newDiv2");
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
                           
                            //document.getElementById("loaderContainer").style.display = "block";
                            //setTimeout(function() {
                            //document.getElementById("loaderContainer").style.display = "none";
                            //}); 
                            //var trace_result =JSON.stringify(graphic.attributes)
                            
                            //document.getElementById("newDiv")
                            //.insertAdjacentHTML("afterEnd",trace_result);
                            //displayObjectId(JSON.stringify(graphic.attributes));
                            
                           // console.log(JSON.stringify(result.data));
                            display_edges.innerHTML=JSON.stringify(featureSet);
                          
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
                          var display_junctions=document.getElementById("displayJunctions");
                          display_junctions.innerHTML= allFeaturesString ;
                          console.log("added"); 
                      }
                  }
                }
            }
            sum_total= sum_Edge + sum_Junction;
            console.log(sum_Edge);
            console.log(sum_Junction);
            console.log(sum_total);
            sumElement.textContent = ": (" + sum_total +")";
            sumElement1.textContent = ": (" + sum_Edge +")";
            sumElement2.textContent = ": (" + sum_Junction +")";

            resultDiv.appendChild(sumElement);
            count_edges.appendChild(sumElement1);
            count_junction.appendChild(sumElement2);

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

   

    
 
    
      
      
    
    


    
    

