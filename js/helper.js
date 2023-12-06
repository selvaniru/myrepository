/**
 * Author: Harish KV
 * harishkv@ultsglobal.com
 */

require(["dojo/_base/declare",
'dojo/_base/lang'], function(declare,lang){
  declare("studioat.js.gnUtility.ags",null, {
    constructor: function (config) {
      lang.mixin(this, config);
    },
  
    urlMapServer: function (serviceName, layerId) {
      var url = this.portalUrl + serviceName + '/MapServer';
      if (layerId) {
        url += '/' + layerId;
      }
      return url;
    },
    urlGeometryServer: function () {
      return this.portalUrl + '/Utilities/Geometry/GeometryServer';
    },
    urlGNUtility: function (serviceName, layerId, operation) {
      var url = this.portalUrl  + serviceName + '/MapServer/exts/GeometricNetworkUtility';
      if (layerId) {
        url += '/GeometricNetworks/' + layerId;
      }
      if (operation) {
        url += '/' + operation;
        //https://waternet.ulgis.com/server/rest/services/sample/watersa/MapServer
      }
      return url;
    }
  });
  

 
});
