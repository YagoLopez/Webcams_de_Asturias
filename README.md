![Status](https://img.shields.io/badge/status-ok-green.svg) ![Maintenance](https://img.shields.io/maintenance/yes/2016.svg?maxAge=2592000) ![License](https://img.shields.io/dub/l/vibe-d.svg?maxAge=2592000)


# Webcams de Asturias
<p><i>(Español)</i></p>

- <strong>Aplicación Web Progresiva (PWA) que muestra Imágenes de cámaras web situadas en el Principado de Asturias</strong>

- Arquitectura basada en el Patrón MVC siguiendo las directrices de buenas prácticas para AngularJS que
se pueden consultar en el siguiente artículo:
<a href="https://toddmotto.com/rethinking-angular-js-controllers/">Link</a>
Actualmente, las nuevas versiones de Angular no siguen el patrón MVC ya que se basan en una arquitectura de componentes.

- Incorpora un "Service Worker" que proporciona funcionalidad off-line

- <div><a href="http://mobt.me/XfKL" target="_blank">Demo para desktop (pantalla grande)</a></div>
- <div>
  <a href="http://yagolopez.github.io/Webcams_de_Asturias/www/index.html" target="_blank">
  Demo para móvil (pantalla pequeña)</a>
  </div>

Las cámaras están agrupadas según las siguientes categorías:

- Playas
- Poblaciones
- Puertos (marítimos)
- Montaña

Hay tres formas de visualizar las imágenes de las webcams:

- Listado
- Mosaico
- Mapa

También se pueden filtrar según distintos criterios:

- Por categoría
- Por concejo
- Búsqueda por cadena de texto

Como valor añadido se pueden consultar diversas informaciones meteorológicas, como la temperatura, imágenes de satélite, etc.

También se ofrecen datos estadísticos de la base de datos, como: agrupación de cámaras web por concejo, categoría, distribución geográfica, etc.

<h1>Tecnologías empleadas</h1>

- Ionic Framework 1+ (Interfaz de usuario)
- AngularJS
- Base de Datos: Google Fusion Tables
- Apache Cordova/PhoneGap (Acceso a API de móvil mediante Javascript)
- Intel Crosswalk Runtime (Compilación cruzada a Android e IOS)

Probado en:

- Chrome (últimas versiones)
- Microsoft Edge
- Internet Explorer (últimas versiones)
- Android
- IOS (emulador)

---
<p><i>(English)</i></p>

<strong>Progressive Web App (PWA) showing real time images from webcams located at the Principality of Asturias</strong>

The architecture of this App is based on MVC Pattern and follows AngularJS Best Practices:
<a href="https://toddmotto.com/rethinking-angular-js-controllers/">Link</a>

