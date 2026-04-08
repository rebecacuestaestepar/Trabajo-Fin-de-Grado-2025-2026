import requests
import logging

logger = logging.getLogger(__name__)

class ClienteMoodle:
    def __init__(self, host):
        self.host = host.rstrip('/')

        self.servicio = "moodle_mobile_app"
    
    def obtener_token(self, usuario, contrasena):
        url = f"{self.host}/login/token.php"
        datos = {
            'username': usuario,
            'password': contrasena,
            'service': self.servicio
        }

        try: 
            respuesta = requests.post(url, data=datos)
            datos_respuesta = respuesta.json()

            if 'errorcode' in datos_respuesta:
                logger.error(f"Error al obtener token: {datos_respuesta}")
                return None
            
            return datos_respuesta.get('token')
        
        except requests.RequestException as e:
            logger.error(f"Error de conexión al obtener token: {e}")
            return None
    
    def obtener_info_usuarios(self, token):
        url = f"{self.host}/webservice/rest/server.php"
        parametros = {
            'wstoken': token,
            'wsfunction': 'core_webservice_get_site_info',
            'moodlewsrestformat': 'json'
        }

        try:
            respuesta = requests.get(url, params=parametros)
            return respuesta.json()
        except requests.RequestException as e:
            logger.error(f"Error de conexión al obtener información del usuario: {e}")
            return None
