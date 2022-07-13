// Initialize and add the map
function initMap() {
	var locations = makeMarker()

	var map = new google.maps.Map(document.getElementById('map'), {
		zoom: 9,
		center: new google.maps.LatLng(37.6205893, -77.3209268),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	});

	var infowindow = new google.maps.InfoWindow();

	var marker, i;

	for (i = 0; i < locations.length; i++) {
		marker = new google.maps.Marker({
			position: new google.maps.LatLng(locations[i][1], locations[i][2]),
			map: map
		});

		google.maps.event.addListener(marker, 'click', (function (marker, i) {
			return function () {
				infowindow.setContent(`<ul class="marker">
											<li class="name">${locations[i][0].slice(0, -1)}</li>
									   		<li class="address">${locations[i][3]}</li>
									   		<li class="profit">Profit: $${locations[i][4]}</li>
									   </ul>`
				);
				infowindow.open(map, marker);
			}
		})(marker, i));
	};
}


window.initMap = initMap;


function locationMaker() {
	let locations = []
	function createthemarker(remove, name, lat, lng, fullAddress, profit) {
		if (name) {
			if (remove == 'no') {
				locations.push([name, lat, lng, fullAddress, profit])
				console.log(locations)
				return locations
			} else if (remove == 'yes') {
				let tempLocations = locations.filter(value => {
					if (value[0].replace(' ', '') == name) {
						addProfit("no", value[4])
					}
					return value[0].replace(' ', '') != name;
				});
				locations = tempLocations
				return locations
			}
		} else {
			return locations
		}
	}
	return createthemarker;
}

const makeMarker = locationMaker();

function unqIdMaker() {
	let counter = 0
	function createtheid() {
		counter += 1
		if (counter > 9) {
			counter = 0
		}
		return counter
	}
	return createtheid;
}

const unqId = unqIdMaker();


// Geocode



function geocode(name, street, state, profit) {
	let road = street.replace(' ', '+')
	let location = `${road} ${state}`
	axios.get('https://maps.googleapis.com/maps/api/geocode/json?', {
		params: {
			address: location,
			key: 'AIzaSyBuTBLIJuSzztYub_ - tdQNXTPIvkxPWVL4'
		}
	})
		.then(function (response) {
			let latitude = response.data.results[0].geometry.location.lat
			let longitude = response.data.results[0].geometry.location.lng
			let fullAddress = response.data.results[0].formatted_address
			makeMarker('no', name, latitude, longitude, fullAddress, profit)
			initMap()
		})
		.catch(error => console.log(error))
}

// List

document.querySelector('.btn').addEventListener('click', submit)

document.addEventListener('click', function (e) {
	if (e.target.className == 'editsubmit') {
		submit()
		removeEdit("editor")
	} else if (e.target.className == 'editbtn') {
		edit(e)
	} else if (e.target.className == 'deletebtn') {
		remove(e)
	}
});

function addUpProfit() {
	let totalProfit = 0;
	function addTheProfits(add, profit) {
		if (add == "yes") {
			totalProfit += parseInt(profit)
		} else if (add == "no") {
			totalProfit -= parseInt(profit)
		}
		document.querySelector('#total-profit').innerHTML = `${totalProfit}`
		return totalProfit
	}
	return addTheProfits
}

const addProfit = addUpProfit()

function submit() {
	let name = document.querySelector('.name').value || document.querySelector('.editname').value;
	let street = document.querySelector('.street').value || document.querySelector('.editstreet').value
	let state = document.querySelector('.state').value || document.querySelector('.editstate').value
	let profit = document.querySelector('.profit').value || document.querySelector('.editprofit').value
	if (name && street && state && profit) {
		addProfit("yes", profit)
		let unqName = name + unqId()
		geocode(unqName, street, state, profit)
		let li = document.createElement('li')
		li.id = unqName.replace(' ', '')
		li.className = "job-card"
		li.innerHTML = `<h3>${name}</h3><div class="job-card detail-card">
						<span class="detail-address">${street}</span>
						<span class="detail-profit">Profit: $${profit}</span>
		</div><button type="button" id="${unqName}btn" class="deletebtn">Delete</button><button type="button" id="${unqName}edit" class="editbtn">Edit</button>`
		document.querySelector('.jobList').appendChild(li)
	}
	document.querySelector('.name').value = ""
	document.querySelector('.street').value = ""
	document.querySelector('.state').value = ""
	document.querySelector('.profit').value = ""
}

function remove(e) {
	let list = document.querySelector('.jobList')
	let targetId = e.target.id.replace(' ', '').slice(0, -3)
	let target = document.getElementById(targetId)
	makeMarker('yes', targetId, 0, 0)
	initMap()
	list.removeChild(target)
}

function removeEdit(e) {
	let list = document.querySelector('.jobList')
	let targetId = e
	let target = document.getElementById(targetId)
	makeMarker('yes', targetId, 0, 0)
	initMap()
	list.removeChild(target)
	return true
}

function edit(e) {
	let targetId = e.target.id.replace(' ', '').slice(0, -4)
	let name, street, state, profit
	let array = makeMarker()
	for (let i = 0; i < array.length; i++) {
		if (array[i][0].replace(' ', '') === targetId) {
			name = array[i][0].slice(0, -1)
			if (array[i][3].split(', ').length <= 2) {
				state = array[i][3].split(', ')[0]
				street = " "
			} else {
				state = array[i][3].split(', ')[2].split(' ')[0]
				street = array[i][3].split(', ')[0].concat(", " + array[i][3].split(', ')[1])
			}
			profit = array[i][4]
		}
	}
	if (removeEdit(targetId)) {
		let div = document.createElement('div')
		div.id = 'editor'
		div.className = "job-card"
		div.innerHTML = `<form action="#">
						<label for="name">Name: </label>
						<input type="text" class="editname" value="${name}">
						<label for="street">Street: </label>
						<input type="text" class="editstreet" value="${street}">
						<label for="street">State: </label>
						<input type="text" class="editstate" value="${state}">
						<label for="profit">Profit: </label>
						<input type="text" class="editprofit" value="${profit}">
						<input type="submit" class="editsubmit">
					</form>`
		document.querySelector('.jobList').appendChild(div)
	}
}

// Page Stuff

(function ($) {

	var $window = $(window),
		$body = $('body'),
		$wrapper = $('#page-wrapper'),
		$banner = $('#banner'),
		$header = $('#header');

	// Breakpoints.
	breakpoints({
		xlarge: ['1281px', '1680px'],
		large: ['981px', '1280px'],
		medium: ['737px', '980px'],
		small: ['481px', '736px'],
		xsmall: [null, '480px']
	});

	// Play initial animations on page load.
	$window.on('load', function () {
		window.setTimeout(function () {
			$body.removeClass('is-preload');
		}, 100);
	});

	// Mobile?
	if (browser.mobile)
		$body.addClass('is-mobile');
	else {

		breakpoints.on('>medium', function () {
			$body.removeClass('is-mobile');
		});

		breakpoints.on('<=medium', function () {
			$body.addClass('is-mobile');
		});

	}

	// Scrolly.
	$('.scrolly')
		.scrolly({
			speed: 1500,
			offset: $header.outerHeight()
		});

	// Menu.
	$('#menu')
		.append('<a href="#menu" class="close"></a>')
		.appendTo($body)
		.panel({
			delay: 500,
			hideOnClick: true,
			hideOnSwipe: true,
			resetScroll: true,
			resetForms: true,
			side: 'right',
			target: $body,
			visibleClass: 'is-menu-visible'
		});

	// Header.
	if ($banner.length > 0
		&& $header.hasClass('alt')) {

		$window.on('resize', function () { $window.trigger('scroll'); });

		$banner.scrollex({
			bottom: $header.outerHeight() + 1,
			terminate: function () { $header.removeClass('alt'); },
			enter: function () { $header.addClass('alt'); },
			leave: function () { $header.removeClass('alt'); }
		});

	}

})(jQuery);

let colors = [
	["red", 1],
	["blue", 2],
	["green", 3],
]
