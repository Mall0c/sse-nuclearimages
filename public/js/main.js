var offset = 0;

function getImages(count, offset) {
    var xhr = new XMLHttpRequest();
    const columnsMax = 4;
    xhr.open("GET", "/frontpage/" + count + "/" + offset);
    xhr.responseType = "json";
    xhr.onload = function() {
        var data = xhr.response;
        // if operation is completed and successful handle highscore data client side
        if (data !== null && xhr.readyState === 4 && xhr.status === 200) {
            var currentColumn = 0;
            for (let i = 0; i < data.length; i++) {
                if (currentColumn == columnsMax)
                    currentColumn = 0;
                var elem = document.createElement("img");
                console.log(data);
                var base64String = data[i].split(":");
                elem.src = 'data:image/'+base64String[0] +';base64,' + base64String[1];
                document.getElementById("column" + (currentColumn + 1)).appendChild(elem);
                currentColumn++;
            }
        }
    };
    xhr.send();
}

getImages(20, 0);

window.onscroll = function(ev) {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        offset = offset + 20;
        getImages(20, offset);
    }
};

$(document).ready(function() {
    $("#myForm").submit(function(e) {
        //Stops submit button from refreshing page.
        e.preventDefault();

        var form_data = new FormData(this);

        $.ajax({
            url: '/upload', //location of where you want to send image
            dataType: 'json', // what to expect back from the PHP script, if anything
            cache: false,
            contentType: false,
            processData: false,
            data: form_data,
            type: 'post',
        });
    });
});

function readURL(input) {
    if (input.files && input.files[0]) {

        var reader = new FileReader();

        reader.onload = function(e) {
            $('.image-upload-wrap').hide();

            $('.file-upload-image').attr('src', e.target.result);
            $('.file-upload-content').show();

            $('.image-title').html(input.files[0].name);
        };

        reader.readAsDataURL(input.files[0]);

    } else {
        removeUpload();
    }
}

function removeUpload() {
    $('.file-upload-input').replaceWith($('.file-upload-input').clone());
    $('.file-upload-content').hide();
    $('.image-upload-wrap').show();
}
$('.image-upload-wrap').bind('dragover', function() {
    $('.image-upload-wrap').addClass('image-dropping');
});
$('.image-upload-wrap').bind('dragleave', function() {
    $('.image-upload-wrap').removeClass('image-dropping');
});