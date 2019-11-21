window.addEventListener('load', function(){
    let form = document.getElementById('locationForm');
    form.addEventListener('submit', function(event){
        event.preventDefault();
        if(form.checkValidity()){
            getReps();
            getVotingLocations();
        }
        form.classList.add('was-validated');
    });
});

function getReps(){
    let zipcode = document.getElementById("zipcode").value.trim();
    if(zipcode.length !== 5 || parseInt(zipcode) === NaN){
        console.error(`Invalid zipcode: ${zipcode}`);
        return;
    }else{
        fetch(`/representatives?zipcode=${zipcode}`)
        .then(res => {
            try{
                return res.json();
            }catch(e){
                console.error("Error in getReps(): ", e);
                return JSON.parse('{"error": "Could not get representatives"}');
            }
        })
        .then(data => {
            populateRepresentatives(data);
        })
        .then(() => {
            return document.getElementsByClassName("copy-rep");
        })
//         .then(items => {
//             // Add support "clicking" links or copying text with the keyboard
//             for(let i=0; i<items.length; i++){
//                 items[i].addEventListener("keyup", function(e){
//                     if(e.keyCode === 13){
//                         e.preventDefault();
//                         accessibleAction(items[i]);
//                     }
//                 });
//             }
//         })
        .catch(err => {
            alert(err);
        });
    }
}

function getVotingLocations(){
    let form = document.getElementById("locationForm");
    let params = new URLSearchParams(new FormData(form));
    
    fetch(`/locations?${params.toString()}`)
    .then(res => {
        try{
            return res.json();
        }catch(e){
            console.error("Error in getVotingLocations(): ", e);
            return JSON.parse('{"error": "Could not get voting locations"}');
        }
    })
    .then(data => {
        populateVotingLocations(data);
    })
    .then(() => {
        return document.getElementsByClassName("copy-loc");
    })
//     .then(items => {
//         // Add support "clicking" links or copying text with the keyboard
//         for(let i=0; i<items.length; i++){
//             items[i].addEventListener("keyup", function(e){
//                 if(e.keyCode === 13){
//                     e.preventDefault();
//                     accessibleAction(items[i]);
//                 }
//             });
//         }
//     })
    .catch(err => {
        alert(err);
    });
}

function populateRepresentatives(data){
    let container = document.getElementById("representatives-container");
    // Remove all existing representatives
    while(container.firstChild)
        container.removeChild(container.firstChild);
    
    let jsonData = JSON.parse(data);
    
    if(jsonData.hasOwnProperty("error")){
        let errormsg = document.createElement("li");
        errormsg.classList.add("list-group-item");
        errormsg.innerHTML = `<p class="card-text">${jsonData.error}</p>`;
        container.appendChild(errormsg);
        return;
    }
    
    let reps = jsonData.results;
    
    // Adds each representative to the "Representative" card
    reps.forEach((item, index) => {
        let singleRep = document.createElement("li");
        singleRep.classList.add("list-group-item");
        
        let repName;
        if(index >= reps.length-2)
            repName = `Sen. ${item.name}`;
        else
            repName = `Rep. ${item.name}`;
        
        singleRep.innerHTML = `
        <h5 class="card-title mb-0">${repName}</h5>
        <p class="mb-0">${item.party}</p>
        <p class="mb-0 copy-rep">${item.phone}</p>
        <a class="card-text btn btn-secondary btn-sm" href="${item.link}" target="_blank">Website</a>`;
        
        container.appendChild(singleRep);
    });
}

function populateVotingLocations(data){
    let container = document.getElementById("locations-container");
    // Remove all existing voting locations from the map
    window.votingLocGroup.removeAll();
    // Remove all existing voting locations from the container
    while(container.firstChild)
        container.removeChild(container.firstChild);
    
    let jsonData = JSON.parse(data);
    
    if(jsonData.hasOwnProperty("error")){
        let errormsg = document.createElement("li");
        let errortxt;
        if(jsonData.error.message === "Election unknown")
            errortxt = "No known upcoming elections";
        else
            errortxt = jsonData.error.message;
        
        errormsg.classList.add("list-group-item");
        errormsg.innerHTML = `<p class="card-text">${errortxt}</p>`;
        
        container.appendChild(errormsg);
        if(window.homePoint){
            window.map.removeObject(window.homePoint);
            window.homePoint = null;
        }
        return;
    }
    
    // Add the address the user entered onto the map
    let homeAddress = jsonData.normalizedInput;
    addLocationToMap(homeAddress, true, false);
    
    if(jsonData.hasOwnProperty("earlyVoteSites")){
        let earlyVotingLocations = jsonData.earlyVoteSites;
        // Add each early voting location to the list and map
        earlyVotingLocations.forEach((item) => {
            addLocationToList(container, item, true, homeAddress);
            addLocationToMap(item, false);
        });
    }
    
    if(jsonData.hasOwnProperty("pollingLocations")){
        let votingLocations = jsonData.pollingLocations;
        // Add each standard voting location to the list and map
        votingLocations.forEach((item, index) => {
            addLocationToList(container, item, false, homeAddress);
            addLocationToMap(item, false, index===votingLocations.length-1);
        });
    }
}

function addLocationToList(parent, item, isEarlyVoting, homeAddress){
    let singleLocation = document.createElement("li");
    singleLocation.classList.add("list-group-item");
    let address = `${item.address.line1}, ${item.address.city}, ${item.address.state}, ${item.address.zip}`;
    
    singleLocation.innerHTML = `<h5 class="card-title mb-0">${item.address.locationName}</h5>`;
    if(isEarlyVoting)
        singleLocation.innerHTML += "<p class='mb-0 font-italic'>Early Voting Location</p>";
    let sourceLoc = `${homeAddress.line1}, ${homeAddress.city}, ${homeAddress.state}, ${homeAddress.zip}`.replace(" ", "-");
    let destLoc = address.replace(" ", "-");
    singleLocation.innerHTML += `
    <p class="copy-loc mb-0">${address}</p>
    <a class="card-text btn btn-secondary btn-sm" href="https://wego.here.com/directions/mix/${sourceLoc}/${destLoc}" target="_blank">Directions</a>`;
    
    parent.appendChild(singleLocation);
}

function addLocationToMap(item, isHome, updateCenter){
    let geocoder = window.platform.getGeocodingService();
    let searchTxt;
    
    if(isHome)
        searchTxt = `${item.line1} ${item.city} ${item.state}`;
    else
        searchTxt = `${item.address.line1} ${item.address.city} ${item.address.state}`;
        
    let geocodingParams = {
        searchText: searchTxt,
        jsonattributes: 1
    };
    
    geocoder.geocode(geocodingParams, (response) => {
            let name;
            if(isHome)
                name = "Your Address";
            else
                name = `${item.address.locationName}`;
            // Passes coordinates to add location to map
            addToMap(response, name, isHome, updateCenter);
    });
}

function addToMap(result, name, isHome, updateCenter){
    let locations = result.response.view[0].result;
    for(let i=0; i<locations.length; i++){
        let position = {
            lat: locations[i].location.displayPosition.latitude,
            lng: locations[i].location.displayPosition.longitude  
        };
        let marker = new H.map.Marker(position);
        marker.setData(`<b>${name}</b><div>${locations[0].location.address.label}</div>`);
        if(isHome){  
            marker.setIcon(window.homeIcon);
        }
        window.votingLocGroup.addObject(marker);
    }
    if(updateCenter){
        // Center map around all voting locations
        window.map.getViewModel().setLookAtData({
            bounds: window.votingLocGroup.getBoundingBox()
        });
    }
}

function geocodeError(error){
    alert("Can't connect to Here WeGo Maps server");
}

function accessibleAction(item){
    // Open link if the underlying element is an anchor tag
    if(item.firstChild.nodeName === "A"){
        window.open(item.firstChild.getAttribute("href"), "_blank");
        return;
    }
    
    // Copy the text if the underlying element is not an anchor tag
    let currentRange;
    if(document.getSelection().rangeCount > 0){
        currentRange = document.getSelection().getRangeAt(0);
        window.getSelection().removeRange(currentRange);
    }else{
        currentRange = false;
    }
    
    let copyRange = document.createRange();
    copyRange.selectNode(item);
    window.getSelection().addRange(copyRange);
    document.execCommand("copy");
    
    window.getSelection().removeRange(copyRange);
    if(currentRange){
        window.getSelection().addRange(currentRange);
    }
}