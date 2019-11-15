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
        .then(items => {
            for(let i=0; i<items.length; i++){
                items[i].addEventListener("keyup", function(e){
                    if(e.keyCode === 13){
                        e.preventDefault();
                        copyText(items[i]);
                    }
                });
            }
        })
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
    .then(items => {
        for(let i=0; i<items.length; i++){
            items[i].addEventListener("keyup", function(e){
                if(e.keyCode === 13){
                    e.preventDefault();
                    copyText(items[i]);
                }
            });
        }
    })
    .catch(err => {
        alert(err);
    });
}

function populateRepresentatives(data){
    let container = document.getElementById("representatives-container");
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
        <p class="mb-0 copy-rep" tabindex="0"><a class="mb-0" href="tel:${item.phone}" tabindex="0">${item.phone}</a></p>
        <p class="card-text copy-rep" tabindex="0"><a class="card-text" href="${item.link}">${item.link}</a></p>`;
        
        container.appendChild(singleRep);
    });
}

function populateVotingLocations(data){
    let container = document.getElementById("locations-container");
    window.votingLocGroup.removeAll();
    
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
    addLocationToMap(jsonData.normalizedInput, true, false);
    
    if(jsonData.hasOwnProperty("earlyVoteSites")){
        let earlyVotingLocations = jsonData.earlyVoteSites;
        earlyVotingLocations.forEach((item) => {
            addLocationToList(container, item, true);
            addLocationToMap(item, false);
        });
    }
    
    if(jsonData.hasOwnProperty("pollingLocations")){
        let votingLocations = jsonData.pollingLocations;
        votingLocations.forEach((item, index) => {
            addLocationToList(container, item);
            addLocationToMap(item, false, index===votingLocations.length-1);
        });
    }
}

function addLocationToList(parent, item, isEarlyVoting){
    let singleLocation = document.createElement("li");
    singleLocation.classList.add("list-group-item");
    
    singleLocation.innerHTML = `<h5 class="card-title mb-0">${item.address.locationName}</h5>`;
    if(isEarlyVoting)
        singleLocation.innerHTML += "<p class='mb-0 font-italic'>Early Voting Location</p>";
    singleLocation.innerHTML += `<p class="card-text copy-loc" tabindex="0">${item.address.line1}, ${item.address.city}, ${item.address.state} ${item.address.zip}</p>`;
    
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
        window.map.getViewModel().setLookAtData({
            bounds: window.votingLocGroup.getBoundingBox()
        });
    }
}

function geocodeError(error){
    alert("Can't connect to Here WeGo Maps server");
}

function copyText(item){
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