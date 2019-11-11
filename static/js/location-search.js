window.addEventListener('load', function(){
    let form = document.getElementById('locationForm');
    form.addEventListener('submit', function(event){
        event.preventDefault();
        if(form.checkValidity()){
            getReps();
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
            console.log("Recieved: ", data);
        })
        .catch(err => {
            alert(err);
        });
    }
}