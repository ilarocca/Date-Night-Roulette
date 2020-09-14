//                ~~~~~~~~~GOOGLE API~~~~~~~~

const googleApiKey = 'AIzaSyDM8WnT3OGrqhKlfIf9BVCadcu83FdAZgs'

const googleBaseUrl = 'https://maps.googleapis.com/maps/api/place/textsearch/json'

const proxyurl = "https://cors-anywhere.herokuapp.com/";

function formatQueryParams(params) {
    const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)

    return queryItems.join('&'); 
}

function getFoodResult(foodAddress, foodType) {
    const params = {
        query: foodAddress + foodType,
        type: 'restaurant',
        key: googleApiKey,
        radius: 32500,
        opennow: 'true',

    };

    const queryString = formatQueryParams(params);
    const url = googleBaseUrl + '?' + queryString; 

    console.log(url)

    fetch(proxyurl + url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => generateFoodResult(responseJson))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function generateFoodResult(responseJson) {
    console.log(responseJson)
    $('#food-results-list').empty();

    // Gets random result 
    const number = Math.floor(Math.random() * responseJson.results.length)
    console.log(number);
    $('#food-results-list').append(
        `
        <li>
        <h3>${responseJson.results[number].name}</h3>
        <p>Address: ${responseJson.results[number].formatted_address}</p>
        </li>
        `
    )
}

//              ~~~~~~~UNOGS API~~~~~~~

const netflixBaseUrl = 'https://unogsng.p.rapidapi.com/search' 

function getWatchResultTotal(watchType, genreType) {

    const params = {
        genrelist: genreType,
        type: watchType,
        countrylist: "78",
        limit: 1, 
    };

    const queryString = formatQueryParams(params);
    const url = netflixBaseUrl + '?' + queryString; 

    console.log(url)

    fetch(url, {
        "method": "GET",
	    "headers": {
		"x-rapidapi-host": "unogsng.p.rapidapi.com",
		"x-rapidapi-key": "84d0b0e8damsha28a1dfe56f630ep1fbfedjsn7b96ad0f0af9"
	    }
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => getWatchResult(url, responseJson))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function getWatchResult(url, responseJson) {

    console.log(responseJson.total);
    //             ~~~ Get random number based on total ~~~
    const offsetParam = Math.floor(Math.random() * responseJson.total)

    console.log(offsetParam); 

    const offsetString = 'offset=' + offsetParam

    const newUrl = url + '&' + offsetString; 

    console.log(newUrl)

    fetch(newUrl, {
        "method": "GET",
	    "headers": {
		"x-rapidapi-host": "unogsng.p.rapidapi.com",
		"x-rapidapi-key": "84d0b0e8damsha28a1dfe56f630ep1fbfedjsn7b96ad0f0af9"
	    }
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => generateWatchResult(responseJson))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function generateWatchResult(responseJson) {
    console.log(responseJson)
    $('#watch-results-list').empty();

    console.log(responseJson.results[number].title);

    $('#watch-results-list').append(
        `
        <li>
        <h3>${responseJson.results[number].title}</h3>
        <p>Description: ${responseJson.results[number].synopsis}</p>
        <img id="movie-image" src="${responseJson.results[number].img}">
        </li>
        `
    )
}

//              ~~~~~~~~ OMDb API ~~~~~~~~

function getWatchResultScore(title) {

}


//               ~~~~~~~ EVENT HANDLERS ~~~~~~

function submitFoodForm() {
    $('#js-food-form').submit(event => {
        event.preventDefault(); 
        const foodAddress = $('#js-address').val(); 
        const foodType = $('#js-food-type').val();
        getFoodResult(foodAddress, foodType);
    });
}

function submitWatchForm() {
    $('#js-watch-form').submit(event => {
        event.preventDefault(); 
        const watchType = $('#js-watch-type').val(); 
        const genreType = $('#js-genre-type').val();
        getWatchResultTotal(watchType, genreType);
    });
}

$(submitFoodForm);
$(submitWatchForm);