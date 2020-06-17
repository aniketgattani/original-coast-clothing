
  var essential_permissions = ["pages_show_list"];
  var APP_ID = '617225772225956';
  var edit = "<%= edit >"

  var load_sdk = function (d, s, id, src) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
        return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = src;
    fjs.parentNode.insertBefore(js, fjs);
  };

  load_sdk(document,'script', 'facebook-jssdk',"//connect.facebook.net/en_US/sdk.js");
  load_sdk(document, 'script', 'Messenger', "//connect.facebook.com/en_US/messenger.Extensions.js");

  window.extAsyncInit = () => {
    MessengerExtensions.getSupportedFeatures(function success(result) {
      let features = result.supported_features;
      if (features.includes("context")) {
          MessengerExtensions.getContext(APP_ID,
              function success(thread_context) {
                  // success
                  document.getElementById("psid").value = thread_context.psid;
              },
              function error(err) {
                  // error
                  console.log(err);
              }
          );
      }
    }, function error(err) {
        console.log(err);
    });


    // document.getElementById('submitButton').addEventListener('click', () => {
    //     MessengerExtensions.requestCloseBrowser(function success() {
    //         console.log("Webview closing");
    //     }, function error(err) {
    //         console.log(err);
    //     });
    // });
  };


  window.fbAsyncInit = function() {
    FB.init({
      appId      : APP_ID,
      cookie     : true,                     // Enable cookies to allow the server to access the session.
      xfbml      : true,                     // Parse social plugins on this webpage.
      version    : 'v7.0'          // Use this Graph API version for this call.
    });

    FB.getLoginStatus(function(response) {   // Called after the JS SDK has been initialized.
      console.log(response);
      if (response.authResponse == null) {
          getPermission()
      }
       statusChangeCallback(response);        // Returns the login status.
    });

  };

  function getPermission(){
    FB.login(function(response) {
      console.log(response.authResponse);
      if (response.accounts != undefined) {
        for(let page of response.accounts.data){
            var option = document.createElement("option");
            option.text = page.name;
            option.value = page.name + "_" + page.id;
            page_ids.push(option.value);
            page_dropdown.add(option);
        }
      }
    }, {
      scope: 'pages_show_list',
      return_scopes : true
    });
  }



  function checkPermissions() {
    FB.api(
      '/me',
      'GET',
      {"fields":"permissions"},
      function(response) {
        flag=1;
        for(let permission of response.permissions.data){
            console.log(response)
          if(essential_permissions.includes(permission.permission) && permission.status !== "granted"){
            flag=0;
          }
        }
        if(flag==0){
          document.getElementById("login").style.display = "inline";
        }
        else{

          document.getElementById("form").hidden = false;
          fetchPages();
        }
      }
    );

  }

   function fetchPages() {
    FB.api(
      '/me',
      'GET',
      {"fields":"accounts"},
      function(response) {
        var page_dropdown = document.getElementById("page_dropdown");
        var page_ids = [];
        console.log(response)
        if (response.accounts == undefined) {
            getPermission()
        }
        for(let page of response.accounts.data){
            var option = document.createElement("option");
            option.text = page.name;
            option.value = page.name + "_" + page.id;
            page_ids.push(option.value);
            page_dropdown.add(option);
        }
        if(edit === "1"){
          var prev_page_id = "<%= pageName >" + "<%= pageId>";
          if(!page_ids.includes(prev_page_id)){
            page_dropdown.value = prev_page_id;
          }
        }
      }
    );

  }


  function statusChangeCallback(response) {  // Called with the results from FB.getLoginStatus().
    console.log('statusChangeCallback');
    console.log(response);                   // The current login status of the person.
    if (response.status === 'connected') {   // Logged into your webpage and Facebook.
      checkPermissions();
    }
  }
