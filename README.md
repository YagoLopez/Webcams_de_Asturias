![Status](https://img.shields.io/badge/status-ok-green.svg) ![Maintenance](https://img.shields.io/maintenance/yes/2016.svg?maxAge=2592000) ![License](https://img.shields.io/dub/l/vibe-d.svg?maxAge=2592000)


# Webcams de Asturias
<p><i>(Español)</i></p>

<a target='_blank' rel='nofollow' href='https://app.codesponsor.io/link/EzE1MgxVeUFQV74og3T6kk1m/YagoLopez/Webcams_de_Asturias'>
  <img alt='Sponsor' width='888' height='68' src='https://app.codesponsor.io/embed/EzE1MgxVeUFQV74og3T6kk1m/YagoLopez/Webcams_de_Asturias.svg' />
</a>

<strong>Aplicación Web Progresiva (PWA) que muestra Imágenes de cámaras web situadas en el Principado de Asturias</strong>

Este es un proyecto experimental para poner en práctica diversos patrones, arquitecturas y tecnologías en una
aplicación desarrollada con el framework AngularJS.

## Características y funcionalidades

- Arquitectura basada en el Patrón MVC y (las que en su momento eran) directrices de buenas prácticas.
NOTA: Actualmente, las nuevas versiones de Angular no siguen el patrón MVC puesto que se basan en una
Arquitectura de Componentes. Referencias:
  - <a href="https://toddmotto.com/rethinking-angular-js-controllers/">Rethinking AngularJS Controllers</a>).
  - <a href="https://medium.com/opinionated-angularjs/angular-model-objects-with-javascript-classes-2e6a067c73bc">
    AngularJS Model Objects with JavaScript Classes</a>).
  - <a href="https://medium.com/opinionated-angularjs/advanced-routing-and-resolves-a2fcbf874a1c">
    AngularJS Advanced Routing and Resolvers</a>).

- Incluye un "Service Worker" que proporciona funcionalidad off-line

- Incluye un fichero "manifest.json" que habilita la instalación en el escritorio y emular la instalación de las apps móviles

- <div><a href="http://mobt.me/XfKL" target="_blank">Demo para desktop</a></div>

- <div><a href="http://yagolopez.github.io/Webcams_de_Asturias/www/index.html" target="_blank">Demo para móvil</a></div>

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

- This is an experimental project to put in practice several patterns, architectures and technologies using the
AngularJS framework.

- The architecture of this app is based on the MVC Pattern and follows AngularJS Best Practices. References:
  - <a href="https://toddmotto.com/rethinking-angular-js-controllers/">Rethinking AngularJS Controllers</a>).
  - <a href="https://medium.com/opinionated-angularjs/angular-model-objects-with-javascript-classes-2e6a067c73bc">
    AngularJS Model Objects with JavaScript Classes</a>).
  - <a href="https://medium.com/opinionated-angularjs/advanced-routing-and-resolves-a2fcbf874a1c">
    AngularJS Advanced Routing and Resolvers</a>).

- It includes a service-worker to enable off-line capabilities