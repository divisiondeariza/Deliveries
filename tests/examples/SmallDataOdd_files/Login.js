define(function(require) {
	var FormSubmit = require('Utils/FormSubmit')
	var Network		= require('Utils/Network')
		Network		= new Network()

	var Modal 		= require('Tools/Modal')
		Modal 		= new Modal()

	function Login() {
		var modalLogin = Modal.create('modalLogin')
			modalLogin.set('content', document.querySelector('#login-modal').innerHTML)

		var login_dropdown = $('.login-dropdown')
		var input_email = login_dropdown.find('.input.email')[0]

	 	function fbLoginCallback(response) {
	 		if (response.status == 'connected') {
				var access_token =   response.authResponse['accessToken'];
				// V2 usa response.id
				var userID = null;

				if('id' in response) userID = response.authResponse.id;
				else userID = response.authResponse.userID;

				FB.api('/me', function(meResponse) {
					var send_data = {
						'fb': meResponse,
						'access_token' : access_token
					}

					// Revisa que el usuario aún no exista en la plataforma
					Network.post(app.url_check_facebook + '/' + userID, send_data, function(data) {
						data = JSON.parse(data);
						if(data) { 
							if(data.response === false) {
								// No existe en la plataforma..
								// Me paso a usuarios/registro y envío este usuario con el token de fb para que lo registre:
								FormSubmit.submit(
									app.url_registro,
									{
										'data[Usuario][facebook_userid]': userID,
										'data[Usuario][facebook_token]': access_token,
										'data[Usuario][email]': meResponse.email,
										'data[Usuario][facebook_email]': response.email,
										'data[Usuario][nombre]': meResponse.name,
										//'data[Usuario][fecha_nacimiento]': meResponse.birthday,
										'data[Usuario][password]': new Date().getTime(),
										'data[Usuario][password2]': new Date().getTime(),
										'data[Usuario][confirmado]': 1,
										'data[Usuario][telefono_fijo]': '0000000000',
										'data[Usuario][celular]': '0000000000'
									}
								);
							} else {
								// Recargar la página ya que se hizo el login
								window.location.reload()
							}
						}
					})
				})
			} else {
				alert( language.script.fallo_facebook )
				return false
			}
	 	}

		$('.site-login').on('click', function() {
			// Primero verifico el estado en FB, con esto decido si despliego el drop o no
			modalLogin.show()
		})

		$('.fb-login').on('click', function() {
			FB.login(
				function(response) {
					fbLoginCallback(response)
				}, 
				{ scope: 'email,user_about_me,user_birthday,user_location,user_website,offline_access,publish_stream',
				  fields : [
				  	{'name':'name'},
				  	{'name':'documento','description':'¿Cuál su número de documento?','type':'text'},
				  	{'name':'celular','description':'Número celular','type' :'text'}
				  ]
				}
			)
		})
	}

	return Login;
})