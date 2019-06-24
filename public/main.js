
$(function(){
    shortenUrl();
    redirectUrl();
});

function shortenUrl(){

    $('#url_submit').click(function(e){
        e.preventDefault();
        // console.log("submit has been pressed");
        var newUrl = $('#url_input').val();
        $.ajax({
            cache: false,
            url: '/shortenUrl',
            type: 'POST',
            data: JSON.stringify({url: newUrl}),
            contentType: "application/json",
            dataType: "JSON",
            success: function(res) {
                console.log("WITHIN ajax success");
                console.log(res);
                document.getElementById('short_link').innerHTML =
                    "<button id='redirect_button' type= 'submit' ></button>";
                document.getElementById('redirect_button').innerText = 'http://localhost:8100/'+res.short_id;
            },
            error: function(err){

                if(newUrl == ""){
                    alert("Nothing was entered, please submit a URL");
                    console.log("Error: Nothing was entered in the input bar");
                }else{
                    alert("Error occured during submission of URL: " + err);
                    console.log("main.js::POST error:: ");
                }
            }
        })
    })
}

function redirectUrl(){
    $(document).on("click", "#redirect_button", (function(e){
        e.preventDefault();
        // console.log("redirect button has been pressed");
        var shortID = document.getElementById('redirect_button').innerText.substr(22);
        // console.log(shortID);
        $.ajax({
            cache: false,
            url:"/getUrl",
            type: "POST",
            data: JSON.stringify({short_id: shortID}),
            contentType: "application/json",
            dataType: "JSON",
            success: function(res){
                // console.log(res);
                // window.location.href = res.url;

                //opens new window directed at original URL
                window.open(res.url);
            },
            error: function(err){
                alert("Error occured during retrieval of an original URL: " + err);
                console.log("main.js::GET error::");
            }
        })
    }));
}