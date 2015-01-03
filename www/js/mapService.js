fmnApp.service('mapService', function() {
   
   this.locateContextOnMap = function(context, userGeolocation, mapId) {
        if(context.addressUsed) {
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({'address': context.location}, function (results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    var position = results[0].geometry.location;
                    console.log("position 1 : " + position);
                    printMapWithUserAndContextLocation("map-canvas", position, context, userGeolocation);
                } else {
                    console.log("Request failed.");
                }
            });
        } else {
            var position = new google.maps.LatLng(context.location.k, context.location.D);
            console.log("position : " + position);
            printMapWithUserAndContextLocation(mapId, position, context, userGeolocation);
        }      
   };
   
   this.locateUserOnMap = function(context, mapId) {
        navigator.geolocation.getCurrentPosition(function (pos) {
            context.location = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
            console.log('position : ' + context.location);
            printMap(mapId, context.location, pos);
        });
   };

   var printMapWithUserAndContextLocation = function(mapId, position, context, userGeolocation) {
       console.log("printing map");
        var mapOptions = {
            center: position,
            zoom: 16,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
      
        var map = new google.maps.Map(document.getElementById(mapId), mapOptions);
        
        var contextMarker = new google.maps.Marker({
            position: position,
            map: map,
            title: context.name
        });
        
        if(userGeolocation && navigator.geolocation) {
            console.log("printing your location");
            navigator.geolocation.getCurrentPosition(function (pos) {
                var userPosition = new google.maps.LatLng(pos.coords.latitude,
                                                          pos.coords.longitude);
                var userMarker = new google.maps.Marker({
                    position:userPosition,
                    map: map,
                    title: 'Your location'
                });
                
                var newLineCoordinates = [
                    position,
                    userPosition
                ];
                
                var newLine = new google.maps.Polyline({
                    path: newLineCoordinates,       
                    strokeColor: "#FF0000",
                    strokeOpacity: 1.0,
                    strokeWeight: 2
                });
                newLine.setMap(map);
            });
        }
   };
   
   var printMap = function(mapId, position, calculatedPosition) {
        console.log("printing map");
        var mapOptions = {
            center: position,
            zoom: 16,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
      
        var map = new google.maps.Map(document.getElementById(mapId), mapOptions);
        
        var marker = new google.maps.Marker({
            position: position,
            map: map,
            title: 'Your location'
        });
        
         var circle = new google.maps.Circle({
                        center: position,
                        radius: calculatedPosition.coords.accuracy,
                        map: map,
                        fillColor: '#46b4c8',
                        fillOpacity: 0.3,
                        strokeColor: '#46b4c8',
                        strokeOpacity: 1.0
                    });
        map.fitBounds(circle.getBounds());
    };    
});


