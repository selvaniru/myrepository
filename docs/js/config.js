/**
 * Author: Harish KV
 * harishkv@ultsglobal.com
 */
var config = {};
require(["esri/Map", "esri/views/MapView","esri/symbols/SimpleMarkerSymbol","esri/symbols/SimpleLineSymbol","esri/PopupTemplate","dojo/domReady!"],function(Map, MapView,SimpleMarkerSymbol,SimpleLineSymbol,PopupTemplate){


config.baseMaps = {};
config.operationalLayers = {GNLayer:'Water_Network' /* service with GeometricNetworks */ };
config.stationLayerId = 10; //for valve isolation (WaterDistribution_Net)
config.valveLayerId = 9; //for valve isolation (WaterDistribution_Net)



config.portalUrl="https://waternet.ulgis.com/server/rest/services/Trial/"
//"https://waternet.ulgis.com/server/rest/services/sample/";

//Water_Network/MapServer/exts/GeometricNetworkUtility/GeometricNetworks/1
config.protocol = "https:";
config.host = "waternet.ulgis.com"; //host arcgis server
config.instance = "server";  //instance name arcgis server
config.rest = "rest";
config.services = "services/sample/";
config.durationMessage = 50000; //toaster message duration 5sec
config.tolerance = 10; //map units
config.outFields = '*';
config.maxTracedFeatures = 100000;
config.findPathAndSource = "esriSPObjFnMinMax"; // (or esriSPObjFnMinSum)
config.traceIndeterminateFlow = false;

config.proxUrl = "http://localhost/ProxyPage/proxy.ashx";
/* it can be need if requests exceed 2048 characters. While there is no official maximum length for a URL some modern browsers have imposed limits */


//used only in this test page for mapping geometric network soe with visibility group layer geometric network in service
config.geometricNetworkGroupLayerIds = [0, 25, 52];
config.geometricNetworkIdForTaskIsolationValve = 1;




//not used since the simplerenderer is not available in new version
config.symbolPointFlag = new SimpleMarkerSymbol({style: "square", // Set the style to 'square'
size: 12, // Set the size of the symbol
color: [0, 255, 0], // Set the fill color (yellow in this case)
outline: {
  color: [0 ,255, 0], // Set the outline color (yellow)
  width: 1 // Set the outline width
}
});
config.symbolPointFlagNotFound = new SimpleMarkerSymbol
  ({
    style: "square", // Set the style to 'square'
    size: 12, // Set the size of the symbol
    color: [255, 255, 0], // Set the fill color (yellow in this case)
    outline: {
      color: [255, 255, 0], // Set the outline color (yellow)
      width: 1 // Set the outline width
    }
    });

config.symbolPointBarrier = new SimpleMarkerSymbol({
  style: "x", // Set the style to 'x'
  size: 12, // Set the size of the symbol
  color: [255, 0, 0], // Set the fill color (red in this case)
  outline: {
    color: [255, 0, 0], // Set the outline color (red)
  width: 1 // Set the outline width
}
});
 
config.symbolPointBarrierNotFound = new SimpleMarkerSymbol
  ({
    style: "x", // Set the style to 'x'
    size: 12, // Set the size of the symbol
    color: [255, 0, 255], // Set the fill color (magenta in this case)
    outline: {
    color: [255, 0, 255], // Set the outline color (magenta)
    width: 1 // Set the outline width
  }
  });
  
config.symbolTraceNetworkEdges = new SimpleLineSymbol
  ({
    style: "solid", // Set the line style to 'solid'
    color: [255, 0, 0], // Set the line color (red in this case)
    width: 3 // Set the line width
    });
config.symbolTraceNetworkJunctions = {
  type:"simple-marker",
  style: "square", // Set the style to 'square'
    size: 10, // Set the size of the symbol
    color: [0, 0, 255], // Set the fill color (blue in this case)
    outline: {
      color:[0, 0, 255], // Set the outline color (blue)
      width: 1 // Set the outline width
    }
    };



        
});    
           
       

      

