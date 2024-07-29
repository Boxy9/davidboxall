$(window).on('load', function () {
    if ($('#preloader').length) {
        $('#preloader').delay(1000).fadeOut('slow', function () {
            $(this).remove();
        });
    }
});

if ("geolocation" in navigator) {
    const geoOptions = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
    };

    function success(pos) {
        const crd = pos.coords;
        const arrLatLng = [];
        arrLatLng.push(crd.latitude);
        arrLatLng.push(crd.longitude);
        // arrLatLng.push(51.442338);
        // arrLatLng.push(-0.985273);
        const fsqAPIToken = 'fsq3BmkrpBLqO6/MNsHUeywxpazEhF/gKN2zlao1VutmIeQ=';
        var map = tt.map({
            key: 'wJVOl0eEEqNDqJn3YEWUaKXqqW2jNL63',
            container: 'map',
            style: 'https://api.tomtom.com/style/1/style/22.*?map=basic_main&poi=poi_dynamic',
            center: {
                lat: arrLatLng[0],
                lng: arrLatLng[1]
            },
            zoom: 13,
            dragPan: !isMobileOrTablet(),
            fadeDuration: 50
        });

        map.addControl(new tt.FullscreenControl({ container: document.querySelector('body') }));
        map.addControl(new tt.NavigationControl());
        map.addControl(new tt.ScaleControl());

        var infoHint = new InfoHint('info', 'bottom-center', 10000)
            .addTo(document.getElementById('map'));

        infoHint.setMessage('Click on POI icons to select them.');

        var popup = null;
        var hoveredFeature = null;

        map.on('load', function () {
            bindMapEvents();
        });

        function bindMapEvents() {
            map.on('click', function (event) {
                var feature = map.queryRenderedFeatures(event.point)[0];
                hidePoiMarker();

                if (feature.sourceLayer === 'Point of Interest') {

                    var query = feature.properties.name || feature.properties.description;
                    performSearch(query, feature.geometry.coordinates)
                        .then((res) => {
                            map.addLayer({
                                'id': 'selectedPoi',
                                'source': {
                                    'type': 'geojson',
                                    'data': {
                                        'type': 'Feature',
                                        'geometry': {
                                            'type': 'Point',
                                            'coordinates': feature.geometry.coordinates
                                        }
                                    }
                                },
                                'type': 'symbol',
                                'paint': {
                                    'text-color': 'rgba(0, 0, 0, 1)',
                                    'text-halo-color': 'rgba(255, 255, 255, 1)',
                                    'text-halo-width': 1
                                },
                                'layout': {
                                    'text-field': (feature.properties.name || feature.properties.description) + res,
                                    'icon-image': `${feature.properties.icon}_pin`,
                                    'icon-anchor': 'bottom',
                                    'text-letter-spacing': 0.1,
                                    'icon-padding': 5,
                                    'icon-offset': [0, 5],
                                    'text-max-width': 10,
                                    'text-variable-anchor': ['top'],
                                    'text-font': ['Noto-Bold'],
                                    'text-size': 14,
                                    'text-radial-offset': 0.2
                                }
                            })
                        });
                }
            });

            map.on('mouseenter', 'POI', function (event) {
                map.getCanvas().style.cursor = 'pointer';
                var feature = map.queryRenderedFeatures(event.point)[0];

                createPopup(feature);
                hoveredFeature = feature;

                map.setFeatureState(feature, { hover: true });
            });

            map.on('mouseleave', 'POI', function (event) {
                map.getCanvas().style.cursor = '';

                if (hoveredFeature) {
                    map.setFeatureState(hoveredFeature, { hover: false });
                }

                hoveredFeature = null;

                if (!event.originalEvent.relatedTarget) {
                    removePopup();
                }
            });

            map.on('click', 'POI', function (event) {
                map.getCanvas().style.cursor = '';

                if (hoveredFeature) {
                    map.setFeatureState(hoveredFeature, { hover: false });
                }

                hoveredFeature = null;

                if (!event.originalEvent.relatedTarget) {
                    removePopup();
                }
            });
        }

        function createPopup(result) {
            var markerSize = 10;
            removePopup();

            var popupOffset = {
                'top': [0, markerSize],
                'top-left': [0, markerSize],
                'top-right': [0, markerSize],
                'bottom': [0, -markerSize],
                'bottom-left': [0, -markerSize],
                'bottom-right': [0, -markerSize],
                'left': [markerSize, -markerSize],
                'right': [-markerSize, -markerSize]
            };

            var htmlContent = document.createElement('div');

            htmlContent.innerHTML = '<div class="popup-container">' +
                '<div class="category">' +
                Formatters.formatCategoryName(result.properties.category) +
                '</div>' +
                '<div class="name">' + (result.properties.name || result.properties.description) + '</div>' +
                '</div>';

            popup = new tt.Popup({ offset: popupOffset })
                .setLngLat(result.geometry.coordinates)
                .setDOMContent(htmlContent)
                .addTo(map)
                .setMaxWidth('200px');

            htmlContent.addEventListener('mouseleave', function () {
                removePopup();
            });
        }

        function removePopup() {
            if (popup) {
                popup.remove();
                popup = null;
            }
        }

        function hidePoiMarker() {
            if (map.getLayer('selectedPoi')) {
                map.removeLayer('selectedPoi');
                map.removeSource('selectedPoi');
            }
        }

        var elements = {
            photoContainer: document.querySelector('.photo-container'),
            reviewsContainer: document.querySelector('.reviews'),
            websitesContainer: document.querySelector('.websites'),
            pricingContainer: document.querySelector('.pricing'),
            ratingContainer: document.querySelector('.rating'),
            phoneContainer: document.querySelector('.phone'),
            hoursContainer: document.querySelector('.hours'),
        };

        var iconsMappings = {
            'facebook': 'tt-icon-facebook',
            'twitter': 'tt-icon-twitter',
            'instagram': 'tt-icon-instagram'
        };

        function renderSearchResult(fuzzyResult, poiResult) {
            handlePhoto(poiResult);
            handleBasicData(fuzzyResult, poiResult);
            handleOpeningHours(poiResult);
            handleContactAndHours(poiResult);
            handleReviews(poiResult);

            // map.flyTo({ center: fuzzyResult.position, offset: [0, 150], animate: false });
            // document.querySelector('.tt-tabs__panel').scrollTo(0, 0);
        };

        function handlePhoto(poiResult) {

            elements.photoContainer.innerHTML = " "

            if (poiResult.photos.length > 0) {
                const dimension = "344x170";
                poiResult.photos.forEach(function (photo, indx) {
                    var imageElement = document.createElement('img');
                    imageElement.setAttribute('alt', 'Image not found.');
                    imageElement.src = photo.prefix + dimension + photo.suffix;
                    elements.photoContainer.appendChild(imageElement);
                    if (indx < (poiResult.photos.length - 1) ){
                        var horizLine = document.createElement("hr");
                        elements.photoContainer.appendChild(horizLine);
                    }
                });
            }
        }

        function handleBasicData(fuzzyResult, poiResult) {
            document.querySelector('.poi-name').textContent = fuzzyResult.place.name || poiResult.poi.name;
            document.querySelector('.address').textContent = fuzzyResult.place.location.formatted_address;

            if (fuzzyResult.place.categories.length > 0) {
                document.querySelector('.category').textContent = Formatters.formatCategoryName(fuzzyResult.place.categories[0].name);
            } else {
                document.querySelector('.category').textContent = "Shop";
            }

            elements.pricingContainer.innerHTML = '';
            elements.ratingContainer.innerHTML = '';

            var rating = poiResult.rating || null;
            var pricing = poiResult.price || null;

            if (rating) {
                elements.ratingContainer.innerHTML =
                    'Rating: <b><span class="rating-value">' + rating + '</span></b>';
            }

            if (pricing) {
                var priceText = " ";
                switch (pricing) {
                    case 1: priceText = "Cheap"; break;
                    case 2: priceText = "Moderate"; break;
                    case 3: priceText = "Expensive"; break;
                    case 4: priceText = "Very Expensive"; break;
                    default: priceText = "Very Cheap";
                }
                elements.pricingContainer.innerHTML =
                    'Pricing: <b><span class="pricing-value">' + priceText + '</span></b>';
            }
        }

        function handleContactAndHours(poiResult) {

            elements.websitesContainer.innerHTML = " ";
            elements.phoneContainer.innerHTML = " ";

            if (poiResult.website) {
                elements.websitesContainer.innerHTML = `<div class="websites">Website</div><a class="website-link" href="${poiResult.website}" target="_blank">${poiResult.website}</a>`;
            }
            if (poiResult.tel) {
                elements.phoneContainer.innerHTML = '<div>Phone</div><div class="phone-number">' + poiResult.tel + '</div>';
            }
            if (poiResult.socialMedia) {
                if (poiResult.socialMedia.facebook_id) {
                    var websiteElement = document.createElement('div');
                    websiteElement.classList.add('website-item');

                    websiteElement.innerHTML = '<div class="social-media-icon ' + iconsMappings["facebook"] + '"></div>' +
                        '<a class="website-link" href="' + poiResult.socialMedia.facebook_id + '" target="_blank">' + poiResult.socialMedia.facebook_id + '</a>';

                    elements.websitesContainer.appendChild(websiteElement);
                };
                if (poiResult.socialMedia.instagram) {
                    var websiteElement = document.createElement('div');
                    websiteElement.classList.add('website-item');

                    websiteElement.innerHTML = '<div class="social-media-icon ' + iconsMappings["instagram"] + '"></div>' +
                        '<a class="website-link" href="' + poiResult.socialMedia.instagram + '" target="_blank">' + poiResult.socialMedia.instagram + '</a>';

                    elements.websitesContainer.appendChild(websiteElement);
                };
                if (poiResult.socialMedia.twitter) {
                    var websiteElement = document.createElement('div');
                    websiteElement.classList.add('website-item');

                    websiteElement.innerHTML = '<div class="social-media-icon ' + iconsMappings["twitter"] + '"></div>' +
                        '<a class="website-link" href="' + poiResult.socialMedia.twitter + '" target="_blank">' + poiResult.socialMedia.twitter + '</a>';

                    elements.websitesContainer.appendChild(websiteElement);
                };
            }
        }

        function handleOpeningHours(poiResult) {

            elements.hoursContainer.innerHTML = " ";

            if (poiResult.hours.display) {
                elements.hoursContainer.innerHTML = '<div class="data-label">Open Hours</div>';
                var websiteElement = document.createElement('div');
                websiteElement.classList.add('hours-range');
                websiteElement.innerHTML = "<div>" + poiResult.hours.display + "</div>";
                elements.hoursContainer.appendChild(websiteElement);
            } else {
                if (poiResult.date_closed) {
                    websiteElement.innerHTML = "<div class='data-label'>Closed :" + poiResult.date_closed + "</div>";
                    elements.hoursContainer.appendChild(websiteElement);
                }
            }
        }

        function handleReviews(poiResult) {

            elements.reviewsContainer.innerHTML = " ";

            if (poiResult.tips.length > 0) {
                elements.reviewsContainer.innerHTML =
                    '<div class="data-label">Most popular reviews</div>' +
                    '<div class="reviews-container"></div>';

                poiResult.tips.forEach(function (review) {
                    var reviewElement = document.createElement('div');
                    reviewElement.classList.add('review-item');

                    var reviewDate = Formatters.dateStringToObject(review.created_at);

                    reviewElement.innerHTML =
                        '<div class="review-date">' + Formatters.formatToDateWithFullMonth(reviewDate) + '</div>' +
                        '<div class="review-text">' + review.text + '</div>';

                    document.querySelector('.reviews-container').appendChild(reviewElement);
                });
            }
        }

        async function performSearch(query, posArr) {

            const userLat = posArr[1];
            const userLng = posArr[0];
            try {
                const searchParams = new URLSearchParams({
                    query,
                    ll: `${userLat},${userLng}`,
                    types: 'place',
                    radius: 1000
                }).toString();
                const searchResults = await fetch(
                    `https://api.foursquare.com/v3/autocomplete?${searchParams}`,
                    {
                        method: 'get',
                        headers: new Headers({
                            Accept: 'application/json',
                            Authorization: fsqAPIToken,
                        }),
                    }
                );

                const data = await searchResults.json();
                var fsqId = " ";
                for (var i = 0; i < data.results.length; i++) {
                    if (typeof data.results[i].place.fsq_id === undefined) {
                        continue;
                    } else {
                        fsqId = data.results[i].place.fsq_id;
                        break;
                    }
                }

                if (fsqId == " ") {
                    return "\n!! No Details !!";
                } else {
                    var poiResult = await fetchPlacesDetails(fsqId);
                    renderSearchResult(data.results[i], poiResult);
                    return "";
                }

            } catch (err) {
                logError(err);
            };

        }

        async function fetchPlacesDetails(fsqId) {
            try {
                const searchParams = new URLSearchParams({
                    fields: 'fsq_id,name,location,photos,rating,hours,price,social_media,tips,tel,email,website,date_closed',
                }).toString();
                const results = await fetch(
                    `https://api.foursquare.com/v3/places/${fsqId}?${searchParams}`,
                    {
                        method: 'get',
                        headers: new Headers({
                            Accept: 'application/json',
                            Authorization: fsqAPIToken,
                        }),
                    }
                );
                const data = await results.json();
                return data;
            } catch (err) {
                logError(err);
            }
        }
    }

    function logError(err) {
        $('#errorMessage').text(`ERROR(${err.code}): ${err.message}`);
    }

    navigator.geolocation.getCurrentPosition(success
        , logError, geoOptions);
} else {
    $('#errorMessage').text("Navigator geolocation is not included in this browser !!");
};