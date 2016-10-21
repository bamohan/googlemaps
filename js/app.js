var map;
var markers = [];
var yelp_phone_numbers = [];
var largeInfowindow = new google.maps.InfoWindow();;

var locations = [{
  title: 'TJs',
  location: {
    lat: 37.311798,
    lng: -122.030951
  },
  yelp_id: 'trader-joes-san-jose-4'
}, {
  title: 'Krung Thai',
  location: {
    lat: 37.327528,
    lng: -121.949867
  },
  yelp_id: 'new-krung-thai-restaurant-san-jose'
}, {
  title: 'Cupertino High',
  location: {
    lat: 37.319433,
    lng: -122.009124
  },
  yelp_id: 'cupertino-high-school-cupertino'
}, {
  title: 'Cupertino Library',
  location: {
    lat: 37.317851,
    lng: -122.028755
  },
  yelp_id: 'cupertino-library-cupertino'
}, {
  title: 'Starbucks',
  location: {
    lat: 37.321950,
    lng: -122.032856
  },
  yelp_id: 'starbucks-cupertino-3'
}];


// Get the business data for a particular business. 
// Create a hash with keys 'yelp_id' and 'yelp_phone_number' and add it to the yelp_phone_numbers array
function getYelpData(yelp_id){
	var YELP_KEY = 'cAXAelu07C1YZchkAiGqdQ';
	var YELP_KEY_SECRET = 'po2IQrHCSCh64RJgveE7m1c27hI';
	var YELP_TOKEN = 'AkyRdT_A_47c_iEv88Nl4H7x37G_AA7G';
	var YELP_TOKEN_SECRET = '92RFWcnCCHeO7H-XLC08kvvDhHA';

	var parameters = {
		oauth_consumer_key: YELP_KEY,
		oauth_token: YELP_TOKEN,
		oauth_timestamp: Math.floor(Date.now()/1000),
		oauth_signature_method: 'HMAC-SHA1',
		oauth_nonce: Math.floor(Math.random() * 1e12).toString(),
		oauth_version : '1.0',
		callback: 'cb'
	};
	var yelp_url = 'https://api.yelp.com/v2/business/' + yelp_id;

	var encodedSignature = oauthSignature.generate('GET',yelp_url, parameters, YELP_KEY_SECRET, YELP_TOKEN_SECRET);
  parameters.oauth_signature = encodedSignature;

	var obj = {};
  var settings = {
    url: yelp_url,
    data: parameters,
    cache: true,                // This is crucial to include as well to prevent jQuery from adding on a cache-buster parameter "_=23489489749837", invalidating our oauth-signature
    dataType: 'jsonp',
    success: function(results) {
    	obj.yelp_id = yelp_id;
    	obj.yelp_phone_number = results.display_phone;
     	yelp_phone_numbers.push(obj);
    },
    fail: function() {
      obj.yelp_id = yelp_id;
    	obj.yelp_phone_number = "ERROR: Could not get phone number from Yelp!!! ";
     	yelp_phone_numbers.push(obj);
    }
  };

	var yelpRequestTimeout = setTimeout(function() {
           alert ("Yelp is unavailable. Please try again later.");
         }, 5000);
  // Send AJAX query via jQuery library.
  $.ajax(settings);

  clearTimeout(yelpRequestTimeout);
}

// Update the 'yelp_phone_numbers' array for each location
// This needs to happen before the google map is loaded. 
function loadYelpPhoneNumbers(){
	for (var i = 0; i < locations.length; i++) {
		getYelpData(locations[i].yelp_id);
  }
}
loadYelpPhoneNumbers();


//Initialize google map,  markers and info windows for the google map 
function initMap() {
  var firstOne = locations[0].location;
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: firstOne.lat,
      lng: firstOne.lng
    },
    zoom: 13
  });

	// When window is resizes, resize the map 
	google.maps.event.addDomListener(window, "resize", function() {
	   var center = map.getCenter();
	   google.maps.event.trigger(map, "resize");
	   map.setCenter(center); 
	});

  var bounds = new google.maps.LatLngBounds();

  // The following group uses the location array to create an array of markers on initialize.
  for (var i = 0; i < locations.length; i++) {
    var position = locations[i].location;
    var title = locations[i].title;
    var yelp_id = locations[i].yelp_id;
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
      populateInfoWindow(this, yelp_id);
      animateMarker(this);
    });
    bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);
}

// Bounce the selected marker. THis happens both when the location is clicked and when the marker is clicked
function animateMarker(marker){
	resetAllAnimations();
  marker.setAnimation(google.maps.Animation.BOUNCE);
}

//Reset other animations so only the active location bounces
function resetAllAnimations(){
	for (marker of markers){
		 marker.setAnimation(null);
	}
}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, yelp_id) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (largeInfowindow.marker != marker) {
    largeInfowindow.marker = marker;

    //Find the corresponding phone number for this marker
    var result = $.grep(yelp_phone_numbers, function(e){ return e.yelp_id == yelp_id; });
    var yelp_info = "Something wrong with the result ";
    if (result[0]){
			yelp_info = result[0].yelp_phone_number;
    } else {
    	yelp_info = yelp_id;
    }
    largeInfowindow.setContent('<div>' + marker.title + '<br>' + yelp_info + '</div>');
    largeInfowindow.open(map, marker);
    // Make sure the marker property is cleared if the infowindow is closed.
    largeInfowindow.addListener('closeclick', function() {
    	largeInfowindow.marker.setAnimation(null);
      largeInfowindow.setMarker(null);
    });
  }
}

initMap();

function mapError() {
	$('#map').append('<h2 class="error">Google Maps unavailable </h2>');
}

//Holds the location data necessary
var Location = function(data, marker) {
  this.title = data.title;
  this.location = data.location;
  this.marker = marker;
  this.yelp_id = data.yelp_id;
};

var ViewModel = function() {
  var self = this;

  this.currentFilter = ko.observable("");

  //Build the list of all locations
  this.locationList = ko.observableArray([]);
  for (var i = 0; i < locations.length; i++) {
    var item = locations[i];
    self.locationList().push(new Location(item, markers[i]));
  }

  this.currentLocation = ko.observable(this.locationList()[0]);

  //Called when a location is selected in the list
  this.selectLocation = function(clickedLocation) {
    var marker = clickedLocation.marker;
    populateInfoWindow(marker, clickedLocation.yelp_id);
    animateMarker(marker);
  };

  // Calculate the short list of items when a search is performed
  this.filteredList = ko.computed(function() {
    var filter = self.currentFilter();
    if (!filter) {
      var originalList = self.locationList();
      for (var i = 0; i < originalList.length; i++) {
        originalList[i].marker.setVisible(true);
      }
      return originalList;
    } else {
      filtered = ko.utils.arrayFilter(self.locationList(), function(item) {
        if (item.title.toLowerCase().includes(filter.toLowerCase())) {
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