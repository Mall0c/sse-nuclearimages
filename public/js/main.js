var offset = 0;
var columnsMax = 4;
var loggedIn;

window.onload = function(){  
  if (!this.document.cookie) {
    document.getElementById("docCok").innerText = "noXtoken";
    //document.cookie = "name=;";
    //document.cookie = "token=;";
    //document.cookie = "loggedIn=0";
  } else 
      document.getElementById("docCok").innerText = (document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")).slice(0, 50);

  
  if (document.cookie.split(';').filter((item) => item.includes('loggedIn=1')).length) {
    this.loggedIn = true;
  } else {
    this.loggedIn = false;
  }
    
    console.log(document.cookie);

    getImages(20, 0);

    if(this.loggedIn === true) {
      this.document.getElementById("settingsIcon").style.visibility = "visible";
      this.document.getElementById("usernameArea").innerText = document.cookie.replace(/(?:(?:^|.*;\s*)name\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    } else {
      this.document.getElementById("usernameArea").innerText ="sign in";
    }
  	
};

function sendToken(xhr) {
  xhr.setRequestHeader("x-access-token", document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1"));
}

function getImages(count, offset) {
  $.ajax({
    url: "/frontpage/" + count + "/" + offset,
    dataType: "json", // what to expect back from the PHP script, if anything
    cache: false,
    contentType: false,
    processData: false,
    type: "GET",
    beforeSend: sendToken,
    success: function(data, textStatus, jQxhr) {
      //console.log(data);
      if (data !== null) {
        var currentColumn = 0;
        for (let i = 0; i < data.length; i++) {
          if (currentColumn == columnsMax) currentColumn = 0;
          var elem = document.createElement("img");
          var base64String = data[i].split(":");
          elem.style = "cursor: pointer;";
          elem.imgID = base64String[0];
          elem.onclick = function() {
            $.ajax({
              url: "/frontpage/"+this.imgID, //location of where you want to send image
              beforeSend: sendToken,
              cache: false,
              contentType: false,
              processData: false,
              type: "GET",
              success: function(data, textStatus, jQxhr) {
                //console.log(data);
                var base64String = data.split(":");
                var elem = document.getElementById("imageForModal");
                elem.src =
                    "data:image/" + base64String[1] + ";base64," + base64String[2];
                imageViewModal.style.display = "block";
              },
              error: function(jqXhr, textStatus, errorThrown) {
                console.log(errorThrown);
              }
            });
          };
          elem.src =
            "data:image/" + base64String[1] + ";base64," + base64String[2];
          document
            .getElementById("column" + (currentColumn + 1))
            .appendChild(elem);
          currentColumn++;
        }
      }
    },
    error: function(jqXhr, textStatus, errorThrown) {
      console.log(errorThrown);
    }
  });
}

window.onscroll = function(ev) {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
    offset = offset + 20;
    getImages(20, offset);
  }
};

$(document).ready(function() {
  $("#uploadFile").submit(function(e) {
    //Stops submit button from refreshing page.
    e.preventDefault();

    var form_data = new FormData(this);

    $.ajax({
      url: "/upload", //location of where you want to send image
      beforeSend: sendToken,
      cache: false,
      contentType: false,
      processData: false,
      data: form_data,
      type: "post",
      success: function(data, textStatus, jQxhr) {
        console.log(data);
        location.reload();
      },
      error: function(jqXhr, textStatus, errorThrown) {
        console.log(errorThrown);
      }
    });
  });
});

$(document).ready(function() {
  $("#login").submit(function(e) {
    //Stops submit button from refreshing page.
    e.preventDefault();

    var form_data = new FormData(this);
    //console.log(document.cookie);
  
    $.ajax({
      url: "/login", //location of where you want to send image
      dataType: "json",
      beforeSend: sendToken,
      cache: false,
      contentType: false,
      processData: false,
      data: form_data,
      type: "post",
      success: function(data, textStatus, jQxhr) {
        //console.log(form_data);
        if (data["auth"] == true) {
          document.cookie = "name="+form_data.get("username");
          document.cookie = "token="+data["token"];
          document.cookie = "loggedIn=1";
          location.reload(); 
        }
      },
      error: function(jqXhr, textStatus, errorThrown) {
        console.log(errorThrown);
      }
    });
  });
});

$(document).ready(function() {
  $("#register").submit(function(e) {
    //Stops submit button from refreshing page.
    e.preventDefault();

    var form_data = new FormData(this);

    $.ajax({
      url: "/register", //location of where you want to send image
      dataType: "json", // what to expect back from the PHP script, if anything
      cache: false,
      contentType: false,
      beforeSend: sendToken,
      processData: false,
      data: form_data,
      type: "post",
      success: function(data, textStatus, jQxhr) {
        console.log(data);
        if (data["auth"] == true) {
          document.cookie = "name="+form_data.get("username");
          document.cookie = "token="+data["token"];
          document.cookie = "loggedIn=1";
          location.reload(); 
        }
      },
      error: function(jqXhr, textStatus, errorThrown) {
        console.log(errorThrown);
      }
    });
  });
});

function readURL(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();

    reader.onload = function(e) {
      $(".image-upload-wrap").hide();

      $(".file-upload-image").attr("src", e.target.result);
      $(".file-upload-content").show();

      $(".image-title").html(input.files[0].name);
    };

    reader.readAsDataURL(input.files[0]);
  } else {
    removeUpload();
  }
}

function removeUpload() {
  $(".file-upload-input").replaceWith($(".file-upload-input").clone());
  $(".file-upload-content").hide();
  $(".image-upload-wrap").show();
}
$(".image-upload-wrap").bind("dragover", function() {
  $(".image-upload-wrap").addClass("image-dropping");
});
$(".image-upload-wrap").bind("dragleave", function() {
  $(".image-upload-wrap").removeClass("image-dropping");
});
