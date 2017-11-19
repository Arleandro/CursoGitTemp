
angular.module('App')
        .factory('AuthJwtHttpInterceptor', AuthJwtHttpInterceptor);


AuthJwtHttpInterceptor.$inject = ['$q', '$location', 'AuthJwtStorage'];
/**
 * https://thinkster.io/angularjs-jwt-auth
 *
 * @param {Object} $q
 * @param {Object} $location
 * @param {AuthJwtStorage} AuthJwtStorage
 * @returns {AuthJwtHttpInterceptor.AppAnonym$0}
 */
function AuthJwtHttpInterceptor($q, $location, AuthJwtStorage) {
    return {
        // Adiciona o header de autorização de forma automatica Authorization header
        request: function (config) {
            if (config.url.indexOf(window.API_ROUTE('')) === 0 && AuthJwtStorage.isAuthenticated()) {
                config.headers.Authorization = 'Bearer ' + AuthJwtStorage.getToken();
            }

            return config;
        }
    };
}

