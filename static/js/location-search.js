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
        console.log(`Invalid zipcode: ${zipcode}`);
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
        <p class="mb-0"><a href="tel:${item.phone}">${item.phone}</a></p>
        <p class="card-text"><a href="${item.link}">Website</a></p>`;
        
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
        return;
    }
    
    if(jsonData.hasOwnProperty("earlyVoteSites")){
        let earlyVotingLocations = jsonData.earlyVoteSites;
        earlyVotingLocations.forEach((item) => {
            addLocationToList(container, item, true);
        });
    }
    
    if(jsonData.hasOwnProperty("pollingLocations")){
        let earlyVotingLocations = jsonData.pollingLocations;
        earlyVotingLocations.forEach((item) => {
            addLocationToList(container, item, false);
        });
    }
}

function addLocationToList(parent, item, isEarlyVoting){
    let singleLocation = document.createElement("li");
    singleLocation.classList.add("list-group-item");
    singleLocation.setAttribute("tabindex", "0");
    
    singleLocation.innerHTML = `<h5 class="card-title mb-0">${item.address.locationName}</h5>`;
    if(!isEarlyVoting)
        singleLocation.innerHTML += "<p class='mb-0 font-italic'>Early Voting Location</p>";
    singleLocation.innerHTML += `<p class="card-text">${item.address.line1}, ${item.address.city}, ${item.address.state} ${item.address.zip}</p>`;
    
    parent.appendChild(singleLocation);
}