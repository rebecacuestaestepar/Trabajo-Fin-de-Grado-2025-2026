# Herramienta de gestión de reservas y calendarios EPS

Repositorio para el Trabajo de Fin de Grado en Ingeniería Informática del curso 2025/2026.

<br>

**Autor:** Rebeca Cuesta Estépar [cite: 4]
**Tutores:** Álvar Arnaiz González, Ana Serrano Mamolar [cite: 8]

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=rebecacuestaestepar_Trabajo-Fin-de-Grado-2025-2026&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=rebecacuestaestepar_Trabajo-Fin-de-Grado-2025-2026)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=rebecacuestaestepar_Trabajo-Fin-de-Grado-2025-2026&metric=bugs)](https://sonarcloud.io/summary/new_code?id=rebecacuestaestepar_Trabajo-Fin-de-Grado-2025-2026)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=rebecacuestaestepar_Trabajo-Fin-de-Grado-2025-2026&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=rebecacuestaestepar_Trabajo-Fin-de-Grado-2025-2026)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=rebecacuestaestepar_Trabajo-Fin-de-Grado-2025-2026&metric=coverage)](https://sonarcloud.io/summary/new_code?id=rebecacuestaestepar_Trabajo-Fin-de-Grado-2025-2026)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=rebecacuestaestepar_Trabajo-Fin-de-Grado-2025-2026&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=rebecacuestaestepar_Trabajo-Fin-de-Grado-2025-2026)

---

## 🌐 URL de la Aplicación
Puedes acceder a la plataforma en producción a través del siguiente enlace:
[**Herramienta de Reservas EPS**](https://front-react-production-25aa.up.railway.app/)

## 📖 Resumen
Este Trabajo de Fin de Grado aborda el diseño y desarrollo de
una aplicación web orientada a la gestión de horarios, reservas y
ocupación de aulas en el contexto universitario. El objetivo principal
del sistema es centralizar en una única plataforma la planificación
docente, la gestión de reservas, y la administración de usuarios y
roles, adaptándose a las necesidades específicas de la organización
universitaria.
<br>
La aplicación se ha desarrollado siguiendo una arquitectura clienteservidor
desacoplada, con un frontend implementado en React y un
backend basado en Django y Django REST Framework. Entre los
aspectos más relevantes del proyecto destaca la incorporación de
un analizador léxico para procesar la información contenida en los
horarios académicos actuales de entrada, permitiendo transformar
las clases impartidas de los diversos grados en reservas periódicas
integrables en el sistema.
<br>
Como resultado, se ha obtenido una aplicación especializada en el
ámbito universitario, capaz de gestionar reservas puntuales y periódicas,
controlar la ocupación de aulas teniendo en cuenta el calendario
académico y ofrecer una base sólida para la explotación posterior
de la información docente. La propuesta desarrollada aporta así una
solución más adaptada al contexto académico que las herramientas
generalistas de reserva de recursos disponibles actualmente.


## 🛠️ Herramientas y Tecnologías
El sistema se ha desarrollado siguiendo una arquitectura cliente-servidor desacoplada[cite: 23], utilizando las siguientes tecnologías destacadas:

* **Frontend:** Desarrollado con **React** e inicializado mediante **Vite** para aprovechar la recarga en caliente (HMR) y lograr una aplicación web más ligera y optimizada[cite: 328, 329].
* **Backend:** Construido con **Django** y **Django REST Framework**, empleando el patrón arquitectónico MVT para centralizar la lógica de negocio y exponer servicios mediante una API REST[cite: 146, 311].
* **Base de Datos:** **MySQL**, elegida como el Sistema Gestor de Base de Datos relacional para almacenar toda la información sobre horarios, reservas y aulas[cite: 284].

## 📄 Licencia
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

## 🎓 Agradecimientos

Proyecto realizado por:
* Rebeca Cuesta Estépar

Proyecto coordinado por:
* Álvar Arnaiz González
* Ana Serrano Mamolar

Agradecer también a la [Universidad de Burgos](https://www.ubu.es/) y, en concreto, a la Escuela Politécnica Superior (EPS), por ofrecer la posibilidad de realizar este proyecto y ser el marco académico sobre el cual se ha desarrollado.
