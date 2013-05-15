'use strict'

four51.app.config(function($httpProvider) {
	$httpProvider.interceptors.push(function($q, $injector, $location, $rootScope, $451) {
		return {
			'request': function(config) {
				return appendAuth(config, false);
			},
			'response': function(response) {
				// using status code 202 [Created] to represent the authentication token has been created. it fits the RFC spec and makes the authentication handling much more RESTy
				if (response.status === 202) {
					$rootScope.$broadcast('event:auth-loginConfirmed');
				}
				var auth = response.headers()['www-authenticate'];
				if (auth)
					$451.cache("Auth", auth, true);

				if ($451.debug)
					console.dir(response.data);

				return response;
			},
			'responseError': function(response) {
				if (response.status === 401) { // unauthorized
					$rootScope.$broadcast('event:auth-loginRequired');
					return $q.defer();
				}

				if (response.status != 200) {
					$rootScope.$broadcast('event:raise-Error', response);
					return false;
				}
				return response;
			}
		};
	});
});