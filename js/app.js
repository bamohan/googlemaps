var map;
var markers = [];
var locations = [{
  title: 'TJs',
  location: {
    lat: 37.311798,
    lng: -122.030951
  }
}, {
  title: 'Krung Thai',
  location: {
    lat: 37.327528,
    lng: -121.949867
  }
}, {
  title: 'Cupertino High',
  location: {
    lat: 37.319433,
    lng: -122.009124
  }
}, {
  title: 'Library',
  location: {
    lat: 37.317851,
    lng: -122.028755
  }
}, {
  title: 'Starbucks',
  location: {
    lat: 37.321950,
    lng: -122.032856
  }
}];

function initMap() {
  var firstOne = locations[0].location;
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: firstOne.lat,
      lng: firstOne.lng
    },
    zoom: 13
  });

  var largeInfowindow = new google.maps.InfoWindow();
  var bounds = new google.maps.LatLngBounds();

  // The following group uses the location array to create an array of markers on initialize.
  for (var i = 0; i < locations.length; i++) {
    var position = locations[i].location;
    var title = locations[i].title;

    // Create a marker per location, and put into markers array.
    var marker = new google.maps.Marker({
      map: map,
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      id: i
    });
    markers.push(marker);

    // Create an onclick event to open an infowindow at each marker.
    marker.addListener('click', function() {
      // Check to make sure the infowindow is not already opened on this marker.
      if (infowindow.marker != marker) {
        infowindow.marker = marker;
        infowindow.setContent('<div>' + marker.title + '</div>');
        infowindow.open(map, marker);
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function() {
          infowindow.setMarker(null);
        });
      }
    });
    bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);
}

initMap();

var Location = function(data, marker) {
  this.title = data.title;
  this.location = data.location;
  this.marker = marker;
};


var ViewModel = function() {
  var self = this;

  this.currentFilter = ko.observable("");
  this.locationList = ko.observableArray([]);
  for (var i = 0; i < locations.length; i++) {
    var item = locations[i];
    self.locationList().push(new Location(item, markers[i]));
  }

  this.currentLocation = ko.observable(this.locationList()[0]);

  this.setCurrentLocation = function(clickedLocation) {
    self.currentLocation(clickedLocation);
  };

  this.filteredList = ko.computed(function() {
    var filter = self.currentFilter();
    if (!filter) {
   	  var originalList = self.locationList();
   	  for (var i=0; i<originalList.length; i++){
   	  	originalList[i].marker.setVisible(true);
   	  }
      return originalList;
    } else {
      filtered = ko.utils.arrayFilter(self.locationList(), function(item) {
        if  (item.title.toLowerCase().includes(filter.toLowerCase())){
        	item.marker.setVisible(true);
        	return true;
        } else {
        	item.marker.setVisible(false);
        	return false;
        }
      });
      return filtered;
    }
  });

};

ko.applyBindings(new ViewModel());