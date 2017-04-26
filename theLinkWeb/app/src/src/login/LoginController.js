(function () {
  angular
    .module('login')
    .controller('LoginController', ['$scope', '$mdDialog', '$mdMedia', '$log', '$window', '$location', 'WebService',
      LoginController
    ])
    //Check if we're logged in.
    .run(['WebService', '$window',
      function (WebService, $window) {
        //Check if they have stored login info.
        //if(!WebService.isLoggedIn()) {
        //  return;
        //}

        ////If they do, check that the login info is valid.
        //WebService.getUserDetails().then(function(resp) {
        //  if(resp.status === 200) //If it's valid just go to the app.
        //    $window.location.href = '/app.html';
        //});
      }
    ]);

  function LoginController($scope, $mdDialog, $mdMedia, $log, $window, $location, WebService) {
    $scope.user = {};
    $scope.register = {};
    $scope.login = login;
    $scope.anonLogin = anonLogin;
    $scope.customFullscreen = $mdMedia('xs') || $mdMedia('sm');
    $scope.loading = false;
    $scope.config = {};

    WebService.basicGet('/meta/configinfo').then(function (result) {
      if (result.status === 200)
        $scope.config = result.data.data;
      else
        $log.debug("Could not get API config.");
    });

    $scope.showRegister = function (ev) {
      var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
      $mdDialog.show({
          controller: DialogController,
          templateUrl: './src/login/templates/register.tmpl.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: false,
          fullscreen: useFullScreen
        })
        .then(function (answer) { //Register the User
          registerUser(answer);
        }, function () { //Cancel Registration
          $scope.register = {};
        });
      $scope.$watch(function () {
        return $mdMedia('xs') || $mdMedia('sm');
      }, function (wantsFullScreen) {
        $scope.customFullscreen = (wantsFullScreen === true);
      });
    };

    // *********************************
    // Internal methods
    // *********************************

    function anonLogin() {
      $log.debug("Logging in anonymously");
      document.getElementById("anonLoginForm").submit();
    }

    function login() {
      $log.debug("User: " + $scope.user.username + " logging in.");
      document.getElementById("loginForm").submit();
    }

    function registerUser(regUser) {
      $scope.loading = true;

      var data = WebService.serializeData({
        email: regUser.username,
        username: regUser.username,
        password: regUser.password
      });

      WebService.basicPost("/user", data).then(function (result) {
        $scope.loading = false;

        var success = result.status == 201;
        var textContent = "";

        switch (result.status) {
          case 409:
            textContent = "That email is already in use!";
            break;
          case 201:
            textContent = "A confirmation email will be sent shortly";
            break;
          default:
            textContent = "Please try again later";
            break;
        }

        var thisDialog = success ?
          $mdDialog.confirm()
          .ok('Take me to theLink')
          .cancel('Take me back to login page') :
          $mdDialog.alert()
          .ok("Okay");

        $mdDialog.show(
          thisDialog
          .parent(angular.element(document.querySelector('#popupContainer')))
          .clickOutsideToClose(false)
          .title('Registration ' + (success ? "Successful" : "Failed"))
          .textContent(textContent)
          .ariaLabel(success ?
            "User Creation Successful" :
            "User Creation Failed")

        ).then(function () {
          if (!success) return;

          WebService.basicPost("/user/login", data).then(function (result) {
            if (result == 200)
              $window.location.href = '/app.html';
            else
              $window.location.href = '/';
          });
        }, function () {
          // What to do if they hit cancel.
          // Right now, nothing.
        });


      });
    }

    function DialogController($scope, $mdDialog) {
      $scope.hide = function () {
        $mdDialog.hide();
      };
      $scope.cancel = function () {
        $mdDialog.cancel();
      };
      $scope.answer = function (answer) {
        $mdDialog.hide(answer);
      };
    }
  }

})();