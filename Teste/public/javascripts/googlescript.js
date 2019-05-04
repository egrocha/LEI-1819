function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    
    //dont send this to backend (??)
    console.log("ID: " + profile.getId()); 
    //send these 
    console.log('Full Name: ' + profile.getName());
    console.log('Given Name: ' + profile.getGivenName());
    console.log('Family Name: ' + profile.getFamilyName());
    console.log("Image URL: " + profile.getImageUrl());
    console.log("Email: " + profile.getEmail());

    var email = profile.getEmail()
    var id_token = googleUser.getAuthResponse().id_token
    console.log(id_token)

    //logout after receiving token
    gapi.auth2.getAuthInstance().disconnect()

    $.post(
        "https://localhost:3000/auth/loginGoogle", 
         {"token": id_token, "email": email}, 'json').error(function(){
            alert("an error occurred");
         }).success(function(data){
            window.location.href = data
         });

    //Send google user data to backend
    /*var xhr = new XMLHttpRequest();
    xhr.open("POST", 'auth/loginGoogle', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        token: id_token,
        email: email
    }));*/
    
    /* res.redirect doesnt work if post request 
    was made from javascript, so we redirect here*/
    //window.location.href = '/user'
}

function addGoogle(googleUser){
    var profile = googleUser.getBasicProfile();
    var id_token = googleUser.getAuthResponse().id_token
    var email = profile.getEmail()

    gapi.auth2.getAuthInstance().disconnect()
    /*
    var xhr = new XMLHttpRequest()
    xhr.open('POST', 'auth/addGoogle', true)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send(JSON.stringify({
        token: id_token,
        email: email
    }))*/

    $.post(
        "https://localhost:3000/auth/addGoogle", 
        {"token" : id_token, "email" : email}, 'json').error(function(){
            alert("an error occurred");
        }).success(function(){
            console.log('success')
            window.location.href = '/user';
        });
}

function onFailure(){
    console.log("Failure during google login")
}

function signOut(){
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
    })
}

