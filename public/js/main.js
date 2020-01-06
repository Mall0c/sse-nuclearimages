var pblOffset = 0;
var imagesPerPage = 20;
var columnsMax = 4;
var loggedIn;

// Get the modal
var uploadModal = document.getElementById("uploadModal");
var loginRegisterModal = document.getElementById("loginRegisterModal");
var imageViewModal = document.getElementById("imageViewModal");
var settingsModal = document.getElementById("settingsModal");
var logoutButton = document.getElementById("logout");

// Get the button that opens the modal
var uploadBtn = document.getElementById("uploadButton");
var loginBtn = document.getElementById("loginButton");
var settingsBtn = document.getElementById("settingsIcon");

// Get the <span> element that closes the modal
var uploadSpan = document.getElementsByClassName("closeUpload")[0];
var loginSpan = document.getElementsByClassName("closeLogin")[0];
var imageViewSpan = document.getElementsByClassName("closeImageView")[0];
var settingsSpan = document.getElementsByClassName("closeSettings")[0];

logoutButton.onclick = function() {
  logOut();
  location.reload();
};

// When the user clicks the button, open the modal
uploadBtn.onclick = function() {
  uploadModal.style.display = "block";
};

loginBtn.onclick = function() {
  if (!loggedIn) loginRegisterModal.style.display = "block";
  else {
    location.href = URL_add_parameter(
      location.href,
      "loadMyProfileImages",
      "1"
    );
  }
};

function searchUsingTag() {
  clearURL();
  location.href = URL_add_parameter(
    location.href,
    "loadTaggedImages",
    document.getElementById("searchTagField").value
  );
}

settingsBtn.onclick = function() {
  settingsModal.style.display = "block";
};

// When the user clicks on <span> (x), close the modal
uploadSpan.onclick = function() {
  uploadModal.style.display = "none";
};

loginSpan.onclick = function() {
  loginRegisterModal.style.display = "none";
};

imageViewSpan.onclick = function() {
  imageViewModal.style.display = "none";
};

settingsSpan.onclick = function() {
  settingsModal.style.display = "none";
};
var reportTrigger = false;
document.getElementById("reportImage").onclick = function() {
  if (!reportTrigger) {
    document.getElementById("reportArea").style.display = "block";
    reportTrigger = true;
  } else {
    document.getElementById("reportArea").style.display = "none";
    reportTrigger = false;
  }
};

$(document).ready(function() {
  $("#rateImage").submit(function(e) {
    //Stops submit button from refreshing page.
    e.preventDefault();

    var form_data = new FormData(this);

    $.ajax({
      url: "/voteImage/" + document.getElementById("imageForModal").imgID,
      beforeSend: sendToken,
      cache: false,
      contentType: false,
      processData: false,
      data: form_data,
      type: "PUT",
      success: function(data, textStatus, jQxhr) {
        //location.reload();
        if (form_data.get("ratingValue") == "+1")
          document.getElementById("imageRating").innerText =
            "Rating: " +
            (Number(document.getElementById("imageForModal").rating) + 1);
        else
          document.getElementById("imageRating").innerText =
            "Rating: " +
            (Number(document.getElementById("imageForModal").rating) - 1);
      },
      error: function(jqXhr, textStatus, errorThrown) {
        console.log(errorThrown);
      }
    });
  });
});

function deleteMyAccount() {
  $.ajax({
    url: "/user/0",
    beforeSend: sendToken,
    cache: false,
    contentType: false,
    processData: false,
    type: "DELETE",
    success: function(data, textStatus, jQxhr) {
      //location.reload();
      console.log("not fully implemented yet. no way to get user id right now");
    },
    error: function(jqXhr, textStatus, errorThrown) {
      console.log(errorThrown);
      console.log("not fully implemented yet. no way to get user id right now");
    }
  });
}

$(document).ready(function() {
  $("#reportForm").submit(function(e) {
    //Stops submit button from refreshing page.
    e.preventDefault();

    var form_data = new FormData(this);

    $.ajax({
      url: "/image/report/" + document.getElementById("imageForModal").imgID,
      beforeSend: sendToken,
      cache: false,
      contentType: false,
      processData: false,
      data: form_data,
      type: "PUT",
      success: function(data, textStatus, jQxhr) {
        //location.reload();
      },
      error: function(jqXhr, textStatus, errorThrown) {
        console.log(errorThrown);
      }
    });
  });
});

document.getElementById("deleteImage").onclick = function() {
  $.ajax({
    url: "/image/" + document.getElementById("imageForModal").imgID,
    beforeSend: sendToken,
    cache: false,
    contentType: false,
    processData: false,
    type: "DELETE",
    success: function(data, textStatus, jQxhr) {
      location.reload();
    },
    error: function(jqXhr, textStatus, errorThrown) {
      console.log(errorThrown);
    }
  });
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == uploadModal) uploadModal.style.display = "none";
  else if (event.target == loginRegisterModal)
    loginRegisterModal.style.display = "none";
  else if (event.target == imageViewModal)
    imageViewModal.style.display = "none";
  else if (event.target == this.settingsModal)
    settingsModal.style.display = "none";
};

window.onload = function() {
  if (
    document.cookie.split(";").filter(item => item.includes("loggedIn=1"))
      .length
  ) {
    this.loggedIn = true;
  } else {
    this.loggedIn = false;
  }

  console.log(document.cookie);

  getImages(imagesPerPage, 0);

  if (this.loggedIn === true) {
    this.document.getElementById("settingsIcon").style.visibility = "visible";
    this.document.getElementById("logoutIcon").style.visibility = "visible";
    this.document.getElementById(
      "usernameArea"
    ).innerText = document.cookie.replace(
      /(?:(?:^|.*;\s*)name\s*\=\s*([^;]*).*$)|^.*$/,
      "$1"
    );
  } else {
    this.document.getElementById("usernameArea").innerText = "sign in";
  }
};

function sendToken(xhr) {
  xhr.setRequestHeader(
    "x-access-token",
    document.cookie.replace(
      /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
      "$1"
    )
  );
}
function getImages(count, offset, tag) {
  var destURL;
  if (getURLParamter("loadMyProfileImages") == "1")
    destURL = "/user/images/" + count + "/" + offset;
  else if (getURLParamter("loadTaggedImages"))
    destURL =
      "/search/" +
      count +
      "/" +
      offset +
      "/" +
      getURLParamter("loadTaggedImages");
  else destURL = "/frontpage/" + count + "/" + offset;

  $.ajax({
    url: destURL,
    dataType: "json", // what to expect back from the PHP script, if anything
    cache: false,
    contentType: false,
    processData: false,
    type: "GET",
    beforeSend: sendToken,
    success: function(data, textStatus, jQxhr) {
      console.log(pblOffset);
      if (data.length == 0) {
        pblOffset -= imagesPerPage;
        return;
      }

      if (offset != 0) {
        pblOffset -= imagesPerPage;
        pblOffset += data.length;
      }

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
              imageID: this.imgID,
              url: "/frontpage/" + this.imgID,
              beforeSend: sendToken,
              cache: false,
              contentType: false,
              processData: false,
              type: "GET",
              success: function(data, textStatus, jQxhr) {
                //console.log(data);
                var base64String = data.split(":");

                document.getElementById("uploaderName").innerText =
                  "Uploaded by " + base64String[0];
                document.getElementById("imageRating").innerText =
                  "Rating: " + base64String[1];

                var elem = document.getElementById("imageForModal");
                elem.imgID = this.imageID;
                elem.rating = base64String[1];
                elem.src =
                  "data:image/" +
                  base64String[2] +
                  ";base64," +
                  base64String[3];
                imageViewModal.style.display = "block";

                // comments
                loadComments();
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
      pblOffset -= imagesPerPage;
      console.log(errorThrown);
    }
  });
}

function loadComments() {
  $.ajax({
    url: "/comments/" + document.getElementById("imageForModal").imgID,
    beforeSend: sendToken,
    cache: false,
    contentType: false,
    processData: false,
    type: "GET",
    success: function(data, textStatus, jQxhr) {
      const commentArea = document.getElementById("commentArea");
      while (commentArea.firstChild) {
        commentArea.removeChild(commentArea.firstChild);
      }

      for (let i = 0; i < data.length; i++) {
        var commentElem = document.createElement("div");
        commentElem.classList = "comment";
        commentElem.innerHTML =
          "CommentID:" +
          data[i].ID +
          " Username: " +
          data[i].Username +
          " Rating: " +
          data[i].Rating +
          "<br>" +
          "Comment:" +
          "<br>" +
          data[i].Text +
          "<br>";

        // Delete comment button
        var deleteElem = document.createElement("button");
        deleteElem.innerText = "remove comment";
        deleteElem.commentID = data[i].ID;
        deleteElem.onclick = function() {
          $.ajax({
            url: "/comments/" + this.commentID,
            beforeSend: sendToken,
            type: "DELETE",
            success: function(data, textStatus, jQxhr) {
              loadComments();
            },
            error: function(jqXhr, textStatus, errorThrown) {
              console.log(errorThrown);
            }
          });
        };

        // Rate positive comment button
        var ratePositiveElem = document.createElement("button");
        ratePositiveElem.innerText = "+1";
        ratePositiveElem.commentID = data[i].ID;
        ratePositiveElem.onclick = function() {
          $.ajax({
            url: "/voteComment/" + this.commentID,
            beforeSend: sendToken,
            type: "PUT",
            data: { ratingValue: "+1" },
            success: function(data, textStatus, jQxhr) {
              loadComments();
            },
            error: function(jqXhr, textStatus, errorThrown) {
              console.log(errorThrown);
            }
          });
        };

        // Rate negative comment button
        var rateNegativeElem = document.createElement("button");
        rateNegativeElem.innerText = "-1";
        rateNegativeElem.commentID = data[i].ID;
        rateNegativeElem.onclick = function() {
          $.ajax({
            url: "/voteComment/" + this.commentID,
            beforeSend: sendToken,
            type: "PUT",
            data: { ratingValue: "-1" },
            success: function(data, textStatus, jQxhr) {
              loadComments();
            },
            error: function(jqXhr, textStatus, errorThrown) {
              console.log(errorThrown);
            }
          });
        };

        // Edit comment button
        var editElem = document.createElement("button");
        var textElem = document.createElement("input");
        var saveElem = document.createElement("button");

        textElem.id = "textElem" + data[i].ID;
        textElem.type = "text";
        textElem.style.display = "none";

        saveElem.id = "saveElem" + data[i].ID;
        saveElem.commentID = data[i].ID;
        saveElem.innerText = "Save Text";
        saveElem.style.display = "none";
        saveElem.onclick = function() {
          $.ajax({
            url: "/comments/" + this.commentID,
            beforeSend: sendToken,
            type: "PUT",
            data: {
              text: document.getElementById("textElem" + this.commentID).value
            },
            success: function(data, textStatus, jQxhr) {
              loadComments();
            },
            error: function(jqXhr, textStatus, errorThrown) {
              console.log(errorThrown);
            }
          });

          document.getElementById("textElem" + this.commentID).style.display =
            "none";
          document.getElementById("saveElem" + this.commentID).style.display =
            "none";
          document.getElementById("editElem" + this.commentID).style.display =
            "block";
        };

        editElem.innerText = "Edit";
        editElem.id = "editElem" + data[i].ID;
        editElem.commentID = data[i].ID;
        editElem.comment = data[i].Text;
        editElem.onclick = function() {
          document.getElementById("textElem" + this.commentID).style.display =
            "block";
          document.getElementById(
            "textElem" + this.commentID
          ).value = this.comment;
          document.getElementById("saveElem" + this.commentID).style.display =
            "block";
          this.style.display = "none";
        };

        // Report comment button
        var reportElem = document.createElement("button");
        var reportTextElem = document.createElement("input");
        var sendReportElem = document.createElement("button");

        reportTextElem.id = "reportTextElem" + data[i].ID;
        reportTextElem.type = "text";
        reportTextElem.style.display = "none";

        sendReportElem.id = "sendReportElem" + data[i].ID;
        sendReportElem.commentID = data[i].ID;
        sendReportElem.innerText = "Send Report";
        sendReportElem.style.display = "none";
        sendReportElem.onclick = function() {
          $.ajax({
            url: "/comment/report/" + this.commentID,
            beforeSend: sendToken,
            type: "PUT",
            data: {
              text: document.getElementById("reportTextElem" + this.commentID)
                .value
            },
            success: function(data, textStatus, jQxhr) {
              console.log(data);
              console.log("reported");
            },
            error: function(jqXhr, textStatus, errorThrown) {
              console.log(errorThrown);
            }
          });

          document.getElementById(
            "reportTextElem" + this.commentID
          ).style.display = "none";
          document.getElementById(
            "sendReportElem" + this.commentID
          ).style.display = "none";
          document.getElementById("reportElem" + this.commentID).style.display =
            "block";
        };

        reportElem.innerText = "Report Image";
        reportElem.id = "reportElem" + data[i].ID;
        reportElem.commentID = data[i].ID;
        reportElem.comment = data[i].Text;
        reportElem.onclick = function() {
          document.getElementById(
            "reportTextElem" + this.commentID
          ).style.display = "block";
          document.getElementById(
            "sendReportElem" + this.commentID
          ).style.display = "block";
          this.style.display = "none";
        };

        commentElem.appendChild(sendReportElem);
        commentElem.appendChild(reportTextElem);
        commentElem.appendChild(reportElem);
        commentElem.appendChild(textElem);
        commentElem.appendChild(saveElem);
        commentElem.appendChild(editElem);
        commentElem.appendChild(rateNegativeElem);
        commentElem.appendChild(ratePositiveElem);
        commentElem.appendChild(deleteElem);
        document.getElementById("commentArea").appendChild(commentElem);
      }
    },
    error: function(jqXhr, textStatus, errorThrown) {
      console.log(errorThrown);
    }
  });
}

$(document).ready(function() {
  $("#sendCommentForm").submit(function(e) {
    //Stops submit button from refreshing page.
    e.preventDefault();
    var form_data = new FormData(this);

    $.ajax({
      url: "/comments/" + document.getElementById("imageForModal").imgID,
      beforeSend: sendToken,
      cache: false,
      contentType: false,
      processData: false,
      data: form_data,
      type: "POST",
      success: function(data, textStatus, jQxhr) {
        loadComments();
      },
      error: function(jqXhr, textStatus, errorThrown) {
        console.log(errorThrown);
      }
    });
  });
});

function logOut() {
  document.cookie = "name=;";
  document.cookie = "token=;";
  document.cookie = "loggedIn=0";
}

var _throttleTimer = null;
var _throttleDelay = 100;
var $window = $(window);
var $document = $(document);

$document.ready(function() {
  $window.off("scroll", ScrollHandler).on("scroll", ScrollHandler);
});

function ScrollHandler(e) {
  //throttle event:
  clearTimeout(_throttleTimer);
  _throttleTimer = setTimeout(function() {
    console.log("scroll");

    //do work
    if ($window.scrollTop() + $window.height() > $document.height() - 100) {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        pblOffset += imagesPerPage;
        getImages(imagesPerPage, pblOffset);
      }
    }
  }, _throttleDelay);
}

/*
window.onscroll = function(ev) {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
    pblOffset += imagesPerPage;
    getImages(imagesPerPage, pblOffset);
  }
};
*/

$(document).ready(function() {
  $("#changeSettings").submit(function(e) {
    //Stops submit button from refreshing page.
    e.preventDefault();

    var form_data = new FormData(this);

    $.ajax({
      url: "/user",
      beforeSend: sendToken,
      cache: false,
      contentType: false,
      processData: false,
      data: form_data,
      type: "put",
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
  $("#uploadFile").submit(function(e) {
    //Stops submit button from refreshing page.
    e.preventDefault();

    var form_data = new FormData(this);

    $.ajax({
      url: "/upload",
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
        if (jqXhr.status == 403) {
          iziToast.show({
            title: "Error: " + jqXhr.responseText,
            message: "Please log in to upload images."
          });
        } else {
          iziToast.show({
            title: "Upload failed",
            message: "Please try again later."
          });
        }
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
      url: "/login",
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
          document.cookie = "name=" + form_data.get("username");
          document.cookie = "token=" + data["token"];
          document.cookie = "loggedIn=1";
          location.reload();
        }
      },
      error: function(jqXhr, textStatus, errorThrown) {
        iziToast.show({
          title: "Error ",
          message: "Wrong username or password."
        });
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
      url: "/register",
      dataType: "json",
      cache: false,
      contentType: false,
      beforeSend: sendToken,
      processData: false,
      data: form_data,
      type: "post",
      success: function(data, textStatus, jQxhr) {
        console.log(data);
        if (data["auth"] == true) {
          document.cookie = "name=" + form_data.get("username");
          document.cookie = "token=" + data["token"];
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

function URL_add_parameter(url, param, value) {
  clearURL();
  var hash = {};
  var parser = document.createElement("a");

  parser.href = url;

  var parameters = parser.search.split(/\?|&/);

  for (var i = 0; i < parameters.length; i++) {
    if (!parameters[i]) continue;

    var ary = parameters[i].split("=");
    hash[ary[0]] = ary[1];
  }

  hash[param] = value;

  var list = [];
  Object.keys(hash).forEach(function(key) {
    list.push(key + "=" + hash[key]);
  });

  parser.search = "?" + list.join("&");
  return parser.href;
}

function clearURL() {
  window.history.replaceState({}, document.title, "/" + "index.html");
}

function getURLParamter(paramName) {
  var url_string = window.location.href;
  var url = new URL(url_string);
  return url.searchParams.get(paramName);
}
