window.addEventListener('load', function(){
    let form = document.getElementById('locationForm');
    form.addEventListener('submit', function(event){
        event.preventDefault();
        if(!form.checkValidity()){
            console.log("Validity check failed");
        }else{
            console.log("Validity check passed");
        }
        form.classList.add('was-validated');
    });
});